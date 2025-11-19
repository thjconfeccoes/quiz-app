import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const STRIPE_SECRET_KEY = Deno.env.get('STRIPE_SECRET_KEY')
    
    if (!STRIPE_SECRET_KEY) {
      throw new Error('STRIPE_SECRET_KEY não configurada')
    }

    // Ler dados JSON do request
    const requestData = await req.json()
    
    console.log('Dados recebidos:', requestData)

    const { amount, currency, product_name, customer_name, success_url, cancel_url } = requestData

    // Preparar dados para o Stripe
    const stripeData = new URLSearchParams({
      'line_items[0][price_data][currency]': currency || 'brl',
      'line_items[0][price_data][product_data][name]': product_name || 'Produto',
      'line_items[0][price_data][unit_amount]': amount.toString(),
      'line_items[0][quantity]': '1',
      'mode': 'payment',
      'success_url': `${success_url}#payment-success`,
      'cancel_url': `${cancel_url}#payment-cancel`,
      'locale': 'pt-BR',
    })

    // Adicionar apenas cartão como método de pagamento
    stripeData.append('payment_method_types[]', 'card')

    console.log('Dados para Stripe:', stripeData.toString())

    // Criar sessão no Stripe
    const stripeResponse = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${STRIPE_SECRET_KEY}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: stripeData.toString(),
    })

    const stripeResult = await stripeResponse.text()
    console.log('Resposta do Stripe:', stripeResult)

    if (!stripeResponse.ok) {
      console.error('Erro do Stripe:', stripeResult)
      return new Response(
        JSON.stringify({ 
          error: 'Erro ao criar sessão de pagamento',
          stripe_error: stripeResult,
          status: stripeResponse.status
        }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    const session = JSON.parse(stripeResult)
    
    return new Response(
      JSON.stringify({ url: session.url }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('Erro na função:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Erro interno do servidor',
        details: error.message 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})