import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MercadoPagoCheckout } from '../../components/MercadoPagoCheckout';
import Card from '../../components/base/Card';
import Button from '../../components/base/Button';
import ProgressBar from '../../components/base/ProgressBar';
import { quizQuestions, signDescriptions } from '../../mocks/questions';

interface UserInfo {
  name: string;
  birthDate: string;
}

interface Answer {
  questionId: number;
  sign: string;
}

export default function Quiz() {
  const navigate = useNavigate();
  const [step, setStep] = useState<'intro' | 'questions' | 'payment' | 'result'>('intro');
  const [userInfo, setUserInfo] = useState<UserInfo>({ name: '', birthDate: '' });
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [result, setResult] = useState<string>('');

  // Verificar se o pagamento foi aprovado ao carregar a página
  useEffect(() => {
    // Verificar hash na URL para pagamento
    const hash = window.location.hash;
    
    if (hash === '#payment-success') {
      // Recuperar dados do localStorage se existirem
      const savedUserInfo = localStorage.getItem('quizUserInfo');
      const savedAnswers = localStorage.getItem('quizAnswers');
      const savedResult = localStorage.getItem('quizResult');
      
      if (savedUserInfo && savedAnswers && savedResult) {
        setUserInfo(JSON.parse(savedUserInfo));
        setAnswers(JSON.parse(savedAnswers));
        setResult(savedResult);
        setStep('result');
        
        // Limpar localStorage após usar
        localStorage.removeItem('quizUserInfo');
        localStorage.removeItem('quizAnswers');
        localStorage.removeItem('quizResult');
        
        // Limpar hash da URL
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    } else if (hash === '#payment-cancel') {
      // Se o pagamento foi cancelado, voltar para a tela de pagamento
      const savedUserInfo = localStorage.getItem('quizUserInfo');
      const savedAnswers = localStorage.getItem('quizAnswers');
      const savedResult = localStorage.getItem('quizResult');
      
      if (savedUserInfo && savedAnswers && savedResult) {
        setUserInfo(JSON.parse(savedUserInfo));
        setAnswers(JSON.parse(savedAnswers));
        setResult(savedResult);
        setStep('payment');
        
        // Limpar hash da URL
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    }
    
    // Também verificar parâmetros de query (fallback)
    const urlParams = new URLSearchParams(window.location.search);
    const paymentStatus = urlParams.get('payment');
    
    if (paymentStatus === 'success' && !hash) {
      const savedUserInfo = localStorage.getItem('quizUserInfo');
      const savedAnswers = localStorage.getItem('quizAnswers');
      const savedResult = localStorage.getItem('quizResult');
      
      if (savedUserInfo && savedAnswers && savedResult) {
        setUserInfo(JSON.parse(savedUserInfo));
        setAnswers(JSON.parse(savedAnswers));
        setResult(savedResult);
        setStep('result');
        
        localStorage.removeItem('quizUserInfo');
        localStorage.removeItem('quizAnswers');
        localStorage.removeItem('quizResult');
        
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    } else if (paymentStatus === 'cancel' && !hash) {
      const savedUserInfo = localStorage.getItem('quizUserInfo');
      const savedAnswers = localStorage.getItem('quizAnswers');
      const savedResult = localStorage.getItem('quizResult');
      
      if (savedUserInfo && savedAnswers && savedResult) {
        setUserInfo(JSON.parse(savedUserInfo));
        setAnswers(JSON.parse(savedAnswers));
        setResult(savedResult);
        setStep('payment');
        
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    }
  }, []);

  const handleStartQuiz = () => {
    if (userInfo.name && userInfo.birthDate) {
      setStep('questions');
    }
  };

  const handleAnswer = (sign: string) => {
    const newAnswers = [...answers, { questionId: quizQuestions[currentQuestion].id, sign }];
    setAnswers(newAnswers);

    if (currentQuestion < quizQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      calculateResult(newAnswers);
      setStep('payment');
    }
  };

  const calculateResult = (allAnswers: Answer[]) => {
    const signCounts: { [key: string]: number } = {};
    
    allAnswers.forEach(answer => {
      signCounts[answer.sign] = (signCounts[answer.sign] || 0) + 1;
    });

    const resultSign = Object.keys(signCounts).reduce((a, b) => 
      signCounts[a] > signCounts[b] ? a : b
    );

    setResult(resultSign);
  };

  const handlePayment = async () => {
    setIsProcessingPayment(true);

    try {
      // Salvar dados no localStorage antes do pagamento
      localStorage.setItem('quizUserInfo', JSON.stringify(userInfo));
      localStorage.setItem('quizAnswers', JSON.stringify(answers));
      localStorage.setItem('quizResult', result);

      // Criar preferência de pagamento do Mercado Pago
      const response = await fetch('https://api.mercadopago.com/checkout/preferences', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_MERCADO_PAGO_ACCESS_TOKEN}`,
        },
        body: JSON.stringify({
          items: [
            {
              title: 'Resultado do Quiz - Seu Verdadeiro Signo',
              description: 'Descubra qual é o seu verdadeiro signo baseado nas suas respostas',
              quantity: 1,
              currency_id: 'BRL',
              unit_price: 3.90
            }
          ],
          payer: {
            name: userInfo.name,
          },
          back_urls: {
            success: `${window.location.origin}/quiz#payment-success`,
            failure: `${window.location.origin}/quiz`,
            pending: `${window.location.origin}/quiz#payment-pending`
          },
          auto_return: 'approved',
          external_reference: `quiz_${Date.now()}_${userInfo.name.replace(/\s/g, '_')}`
        }),
      });

      const data = await response.json();
      console.log('Mercado Pago response:', data);

      if (response.ok && data.init_point) {
        // Redirecionar para o checkout do Mercado Pago
        window.location.href = data.init_point;
      } else {
        console.error('Erro ao criar pagamento:', data);
        alert('Erro ao processar pagamento. Tente novamente.');
        setIsProcessingPayment(false);
      }
    } catch (error) {
      console.error('Erro no pagamento:', error);
      alert('Erro ao processar pagamento. Tente novamente.');
      setIsProcessingPayment(false);
    } finally {
      setIsProcessingPayment(false);
      // Limpar localStorage em caso de erro
      localStorage.removeItem('quizUserInfo');
      localStorage.removeItem('quizAnswers');
      localStorage.removeItem('quizResult');
    }
  };

  const resetQuiz = () => {
    setStep('intro');
    setUserInfo({ name: '', birthDate: '' });
    setCurrentQuestion(0);
    setAnswers([]);
    setResult('');
    // Limpar localStorage
    localStorage.removeItem('quizUserInfo');
    localStorage.removeItem('quizAnswers');
    localStorage.removeItem('quizResult');
    // Limpar parâmetros da URL
    window.history.replaceState({}, document.title, window.location.pathname);
  };

  if (step === 'intro') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-50 to-indigo-100 py-8 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
              ✨ Qual é o seu verdadeiro signo? ✨
            </h1>
            <p className="text-lg text-gray-700 leading-relaxed">
              Será que o signo que você acredita ser realmente combina com a sua personalidade? 
              Responda 25 perguntas e descubra qual é o seu signo verdadeiro de acordo com o seu jeito de ser!
            </p>
          </div>

          <Card className="max-w-md mx-auto">
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Seu nome
                </label>
                <input
                  type="text"
                  value={userInfo.name}
                  onChange={(e) => setUserInfo({ ...userInfo, name: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                  placeholder="Digite seu nome"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Data de nascimento
                </label>
                <input
                  type="date"
                  value={userInfo.birthDate}
                  onChange={(e) => setUserInfo({ ...userInfo, birthDate: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                />
              </div>

              <Button 
                onClick={handleStartQuiz}
                disabled={!userInfo.name || !userInfo.birthDate}
                fullWidth
                size="lg"
              >
                <i className="ri-play-circle-line mr-2"></i>
                Começar o Quiz
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  if (step === 'questions') {
    const question = quizQuestions[currentQuestion];
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-50 to-indigo-100 py-8 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <span className="text-sm font-medium text-gray-600">
                Pergunta {currentQuestion + 1} de {quizQuestions.length}
              </span>
              <span className="text-sm font-medium text-purple-600">
                {userInfo.name}
              </span>
            </div>
            <ProgressBar current={currentQuestion + 1} total={quizQuestions.length} />
          </div>

          <Card>
            <div className="text-center mb-8">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4">
                {question.question}
              </h2>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {question.options.map((option, index) => (
                <Button
                  key={index}
                  variant="outline"
                  onClick={() => handleAnswer(option.sign)}
                  className="p-6 text-left h-auto hover:scale-105 transition-transform"
                >
                  <div className="flex items-center">
                    <span className="w-8 h-8 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center font-bold mr-4 text-sm">
                      {String.fromCharCode(65 + index)}
                    </span>
                    <span className="text-gray-700">{option.text}</span>
                  </div>
                </Button>
              ))}
            </div>
          </Card>
        </div>
      </div>
    );
  }

  if (step === 'payment') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-50 to-indigo-100 py-8 px-4">
        <div className="max-w-2xl mx-auto">
          <Card className="text-center">
            <div className="mb-8">
              <div className="text-6xl mb-4">🔮</div>
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
                Quase lá, {userInfo.name}!
              </h1>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6">
                Seu resultado está pronto!
              </h2>
            </div>

            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 mb-8">
              <p className="text-lg text-gray-700 leading-relaxed mb-4">
                Analisamos suas 25 respostas e descobrimos qual é o seu verdadeiro signo!
                Para revelar este resultado personalizado e exclusivo, há uma pequena taxa de:
              </p>
              <div className="text-4xl font-bold text-purple-600 mb-2">R$ 3,90</div>
              <p className="text-sm text-gray-600">
                Pagamento único e seguro via Mercado Pago
              </p>
            </div>

            <MercadoPagoCheckout 
              userInfo={userInfo} 
              onSuccess={() => setStep('result')} 
            />

            <div className="flex items-center justify-center space-x-4 text-sm text-gray-500 mt-6">
              <div className="flex items-center">
                <i className="ri-shield-check-line mr-1 text-green-500"></i>
                Pagamento Seguro
              </div>
              <div className="flex items-center">
                <i className="ri-lock-line mr-1 text-green-500"></i>
                SSL Criptografado
              </div>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  if (step === 'result') {
    const signInfo = signDescriptions[result as keyof typeof signDescriptions];
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-50 to-indigo-100 py-8 px-4">
        <div className="max-w-2xl mx-auto">
          <Card className="text-center">
            <div className="mb-8">
              <div className="text-6xl mb-4">{signInfo.emoji}</div>
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
                Surpresa, {userInfo.name}!
              </h1>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6">
                Seu verdadeiro signo é {signInfo.name}!
              </h2>
            </div>

            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 mb-8">
              <p className="text-lg text-gray-700 leading-relaxed">
                {signInfo.description}
              </p>
            </div>

            <div className="space-y-4">
              <Button onClick={resetQuiz} fullWidth size="lg">
                <i className="ri-refresh-line mr-2"></i>
                Fazer o Quiz Novamente
              </Button>
              
              <Button 
                variant="outline" 
                onClick={() => navigate('/')}
                fullWidth
              >
                <i className="ri-home-line mr-2"></i>
                Voltar ao Início
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return null;
}
