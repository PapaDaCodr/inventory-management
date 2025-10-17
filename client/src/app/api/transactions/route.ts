import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function POST(req: Request) {
  try {
    const body = await req.json()

    const {
      customer_id,
      cashier_id,
      items,
      subtotal,
      tax_amount,
      discount_amount = 0,
      total_amount,
      payment_method,
      payment_reference,
      notes,
    } = body || {}

    if (!cashier_id || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const transactionNumber = `TXN-${Date.now()}-${Math.random().toString(36).slice(2, 11).toUpperCase()}`

    // 1) Create transaction
    const { data: transaction, error: txnErr } = await supabaseAdmin
      .from('transactions')
      .insert({
        transaction_number: transactionNumber,
        type: 'sale',
        customer_id: customer_id || null,
        cashier_id,
        subtotal,
        tax_amount,
        discount_amount,
        total_amount,
        payment_method,
        payment_reference,
        notes,
        transaction_date: new Date().toISOString(),
      })
      .select()
      .single()

    if (txnErr) {
      return NextResponse.json({ error: txnErr.message }, { status: 400 })
    }

    // 2) Insert transaction items
    const txnItems = items.map((item: any) => ({
      transaction_id: transaction.id,
      product_id: item.product_id,
      quantity: item.quantity,
      unit_price: item.unit_price,
      total_price: item.total_price,
    }))

    const { error: itemsErr } = await supabaseAdmin
      .from('transaction_items')
      .insert(txnItems)

    if (itemsErr) {
      return NextResponse.json({ error: itemsErr.message }, { status: 400 })
    }

    // 3) Decrement inventory and record stock movements
    for (const item of items as Array<{ product_id: string; quantity: number }>) {
      // Pick a target inventory row for the product (latest updated)
      const { data: rows, error: invQueryErr } = await supabaseAdmin
        .from('inventory')
        .select('id, quantity_available')
        .eq('product_id', item.product_id)
        .order('updated_at', { ascending: false })
        .limit(1)

      if (invQueryErr) {
        console.warn(`Inventory lookup failed for product ${item.product_id}:`, invQueryErr.message)
      }

      if (rows && rows.length > 0) {
        const target = rows[0]
        const newQuantity = Math.max(0, (target.quantity_available || 0) - item.quantity)

        const { error: updateErr } = await supabaseAdmin
          .from('inventory')
          .update({
            quantity_available: newQuantity,
            quantity_on_hand: newQuantity,
            last_updated: new Date().toISOString(),
          })
          .eq('id', target.id)
          .select('id')
          .single()

        if (updateErr) {
          console.error('Inventory update failed:', updateErr.message)
        }
      } else {
        console.warn(`No inventory row found for product ${item.product_id}; skipping stock decrement`)
      }

      // Create stock movement record regardless
      const { error: smErr } = await supabaseAdmin
        .from('stock_movements')
        .insert({
          product_id: item.product_id,
          movement_type: 'out',
          quantity: -item.quantity,
          reference_type: 'transaction',
          reference_id: transaction.id,
          notes: `Sale - Transaction ${transactionNumber}`,
          created_by: cashier_id,
        })

      if (smErr) {
        console.error('Stock movement insert failed:', smErr.message)
      }
    }

    return NextResponse.json(transaction, { status: 200 })
  } catch (err: any) {
    console.error('Transaction creation error:', err)
    return NextResponse.json({ error: err?.message || 'Internal Server Error' }, { status: 500 })
  }
}

