import { useState, useEffect } from 'react';
import axios from 'axios';

interface MercadoPagoCheckoutProps {
  userInfo: { name: string; birthDate: string };
  onSuccess: () => void;
}

// Componentes UI simples
const Button = ({ children, onClick, disabled, fullWidth, size, variant }: any) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`${
      fullWidth ? 'w-full' : ''
    } ${
      size === 'lg' ? 'py-3 px-6 text-lg' : 'py-2 px-4 text-sm'
    } ${
      variant === 'outline' 
        ? 'border-2 border-purple-600 text-purple-600 hover:bg-purple-50' 
        : 'bg-purple-600 text-white hover:bg-purple-700'
    } rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
  >
    {children}
  </button>
);

const Card = ({ children, className }: any) => (
  <div className={`bg-white rounded-xl shadow-lg ${className}`}>
    {children}
  </div>
);

export function MercadoPagoCheckout({ userInfo, onSuccess }: MercadoPagoCheckoutProps) {
  const [paymentMethod, setPaymentMethod] = useState<'pix' | 'card'>('pix');
  const [isProcessing, setIsProcessing] = useState(false);
  const [pixData, setPixData] = useState<any>(null);
  const [cardData, setCardData] = useState({
    cardNumber: '',
    cardHolder: '',
    expiryMonth: '',
    expiryYear: '',
    securityCode: '',
    docNumber: ''
  });

  const createPixPayment = async () => {
    setIsProcessing(true);
    try {
      const accessToken = import.meta.env.VITE_MERCADO_PAGO_ACCESS_TOKEN;
      const publicKey = import.meta.env.VITE_MERCADO_PAGO_PUBLIC_KEY;
      
      console.log('Token:', accessToken ? 'Presente' : 'Ausente');
      console.log('Public Key:', publicKey ? 'Presente' : 'Ausente');
      
      // Criar preferência para produção
      const preferenceResponse = await axios.post('https://api.mercadopago.com/checkout/preferences', {
        items: [{
          title: 'Resultado do Quiz - Seu Verdadeiro Signo',
          quantity: 1,
          unit_price: 10.00,
          currency_id: 'BRL'
        }],
        payer: {
          email: `${userInfo.name.toLowerCase().replace(' ', '.')}@quiz.com`,
          name: userInfo.name,
          address: {
            street_name: "Rua Teste",
            street_number: 123,
            zip_code: "12345678"
          }
        },
        payment_methods: {
          payment_types: [{
            id: "pix"
          }, {
            id: "credit_card"
          }]
        },
        statement_descriptor: "QUIZ SIGNOS",
        external_reference: `quiz_${Date.now()}`,
        // URLs de retorno para produção
        back_urls: {
          success: window.location.origin + "/quiz#payment-success",
          failure: window.location.origin + "/quiz",
          pending: window.location.origin + "/quiz#payment-pending"
        },
        auto_return: "approved"
      }, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('Resposta:', preferenceResponse.data);

      // Redirecionar para o checkout de produção
      if (preferenceResponse.data.init_point) {
        window.open(preferenceResponse.data.init_point, '_blank');
      } else {
        alert('Não foi possível gerar o link de pagamento');
      }
    } catch (error: any) {
      console.error('Erro completo:', error);
      if (error.response) {
        console.error('Status:', error.response.status);
        console.error('Dados:', error.response.data);
        alert(`Erro ${error.response.status}: ${error.response.data.message || 'Verifique suas credenciais'}`);
      } else {
        alert('Erro de conexão. Verifique suas credenciais no Mercado Pago.');
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const createCardPayment = async () => {
    setIsProcessing(true);
    try {
      // Primeiro, obter o token do cartão
      const tokenResponse = await axios.post('https://api.mercadopago.com/v1/card_tokens', {
        card_number: cardData.cardNumber.replace(/\s/g, ''),
        cardholder_name: cardData.cardHolder,
        expiration_month: cardData.expiryMonth,
        expiration_year: cardData.expiryYear,
        security_code: cardData.securityCode,
        cardholder_identification: {
          type: 'CPF',
          number: cardData.docNumber.replace(/\D/g, '')
        }
      }, {
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_MERCADO_PAGO_PUBLIC_KEY}`,
          'Content-Type': 'application/json'
        }
      });

      // Depois, criar o pagamento
      const paymentResponse = await axios.post('https://api.mercadopago.com/v1/payments', {
        token: tokenResponse.data.id,
        transaction_amount: 3.90,
        description: 'Resultado do Quiz - Seu Verdadeiro Signo',
        installments: 1,
        payment_method_id: 'master',
        payer: {
          email: `${userInfo.name.toLowerCase().replace(' ', '.')}@quiz.com`,
          identification: {
            type: 'CPF',
            number: cardData.docNumber.replace(/\D/g, '')
          }
        }
      }, {
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_MERCADO_PAGO_ACCESS_TOKEN}`,
          'Content-Type': 'application/json'
        }
      });

      if (paymentResponse.data.status === 'approved') {
        onSuccess();
      } else {
        alert('Pagamento recusado. Verifique os dados do cartão.');
      }
    } catch (error) {
      console.error('Erro ao processar pagamento com cartão:', error);
      alert('Erro ao processar pagamento. Verifique os dados e tente novamente.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePayment = () => {
    if (paymentMethod === 'pix') {
      createPixPayment();
    } else {
      createCardPayment();
    }
  };

  // Verificar status do pagamento PIX
  useEffect(() => {
    if (pixData && !isProcessing) {
      const checkStatus = setInterval(async () => {
        try {
          const response = await axios.get(`https://api.mercadopago.com/v1/payments/${pixData.payment_id}`, {
            headers: {
              'Authorization': `Bearer ${import.meta.env.VITE_MERCADO_PAGO_ACCESS_TOKEN}`
            }
          });

          if (response.data.status === 'approved') {
            clearInterval(checkStatus);
            onSuccess();
          }
        } catch (error) {
          console.error('Erro ao verificar status:', error);
        }
      }, 5000);

      return () => clearInterval(checkStatus);
    }
  }, [pixData, isProcessing, onSuccess]);

  return (
    <div className="space-y-6">
      {/* Seleção de método de pagamento */}
      <div className="flex space-x-4">
        <button
          onClick={() => setPaymentMethod('pix')}
          className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${
            paymentMethod === 'pix'
              ? 'bg-purple-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          <i className="ri-qr-code-line mr-2"></i>
          PIX
        </button>
        <button
          onClick={() => setPaymentMethod('card')}
          className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${
            paymentMethod === 'card'
              ? 'bg-purple-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          <i className="ri-bank-card-line mr-2"></i>
          Cartão
        </button>
      </div>

      {/* Formulário PIX */}
      {paymentMethod === 'pix' && !pixData && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Pagamento via PIX</h3>
          <p className="text-gray-600 mb-4">
            Clique no botão abaixo para gerar seu QR Code PIX. O pagamento é aprovado na hora!
          </p>
          <Button
            onClick={handlePayment}
            disabled={isProcessing}
            fullWidth
            size="lg"
          >
            {isProcessing ? (
              <>
                <i className="ri-loader-4-line mr-2 animate-spin"></i>
                Gerando PIX...
              </>
            ) : (
              <>
                <i className="ri-qr-code-line mr-2"></i>
                Gerar QR Code PIX
              </>
            )}
          </Button>
        </Card>
      )}

      {/* QR Code PIX */}
      {paymentMethod === 'pix' && pixData && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">QR Code para Pagamento PIX</h3>
          <div className="text-center space-y-4">
            <img 
              src={`data:image/png;base64,${pixData.qr_code_base64}`} 
              alt="QR Code PIX" 
              className="mx-auto w-48 h-48"
            />
            <p className="text-sm text-gray-600">
              Escaneie o QR Code com seu app bancário ou copie o código abaixo:
            </p>
            <div className="bg-gray-100 p-3 rounded-lg">
              <p className="text-xs font-mono break-all">{pixData.qr_code}</p>
            </div>
            <Button
              onClick={() => navigator.clipboard.writeText(pixData.qr_code)}
              variant="outline"
              size="sm"
            >
              <i className="ri-file-copy-line mr-2"></i>
              Copiar Código PIX
            </Button>
            <p className="text-sm text-green-600">
              <i className="ri-refresh-line animate-spin mr-2"></i>
              Aguardando pagamento...
            </p>
          </div>
        </Card>
      )}

      {/* Formulário Cartão */}
      {paymentMethod === 'card' && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Dados do Cartão</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Número do Cartão
              </label>
              <input
                type="text"
                placeholder="0000 0000 0000 0000"
                value={cardData.cardNumber}
                onChange={(e) => setCardData({...cardData, cardNumber: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                maxLength={19}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nome no Cartão
              </label>
              <input
                type="text"
                placeholder="NOME COMO ESTÁ NO CARTÃO"
                value={cardData.cardHolder}
                onChange={(e) => setCardData({...cardData, cardHolder: e.target.value.toUpperCase()})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Validade
                </label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    placeholder="MM"
                    value={cardData.expiryMonth}
                    onChange={(e) => setCardData({...cardData, expiryMonth: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    maxLength={2}
                  />
                  <input
                    type="text"
                    placeholder="AA"
                    value={cardData.expiryYear}
                    onChange={(e) => setCardData({...cardData, expiryYear: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    maxLength={2}
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  CVV
                </label>
                <input
                  type="text"
                  placeholder="123"
                  value={cardData.securityCode}
                  onChange={(e) => setCardData({...cardData, securityCode: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  maxLength={3}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                CPF do Titular
              </label>
              <input
                type="text"
                placeholder="000.000.000-00"
                value={cardData.docNumber}
                onChange={(e) => setCardData({...cardData, docNumber: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            <Button
              onClick={handlePayment}
              disabled={isProcessing || !cardData.cardNumber || !cardData.cardHolder || !cardData.expiryMonth || !cardData.expiryYear || !cardData.securityCode || !cardData.docNumber}
              fullWidth
              size="lg"
            >
              {isProcessing ? (
                <>
                  <i className="ri-loader-4-line mr-2 animate-spin"></i>
                  Processando...
                </>
              ) : (
                <>
                  <i className="ri-lock-line mr-2"></i>
                  Pagar R$ 3,90
                </>
              )}
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
