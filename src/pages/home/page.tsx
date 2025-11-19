
import { useNavigate } from 'react-router-dom';
import Button from '../../components/base/Button';
import Card from '../../components/base/Card';

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-50 to-indigo-100">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url('https://readdy.ai/api/search-image?query=mystical%20starry%20night%20sky%20with%20constellation%20patterns%2C%20cosmic%20purple%20and%20pink%20nebula%20colors%2C%20dreamy%20ethereal%20atmosphere%2C%20magical%20zodiac%20symbols%20floating%20in%20space%2C%20celestial%20background%20perfect%20for%20astrology%20quiz%2C%20beautiful%20gradient%20from%20deep%20purple%20to%20soft%20pink%2C%20stars%20twinkling%2C%20cosmic%20dust%2C%20enchanting%20night%20sky%20scene&width=1920&height=1080&seq=hero-bg&orientation=landscape')`
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-purple-900/80 to-pink-900/60" />
        
        <div className="relative z-10 px-4 py-20 md:py-32">
          <div className="max-w-4xl mx-auto text-center text-white">
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              ✨ Qual é o seu <br />
              <span className="bg-gradient-to-r from-yellow-300 to-pink-300 bg-clip-text text-transparent">
                verdadeiro signo?
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl mb-8 text-gray-200 max-w-3xl mx-auto leading-relaxed">
              Descubra qual signo realmente combina com sua personalidade através de um quiz divertido e revelador!
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button 
                size="lg" 
                onClick={() => navigate('/quiz')}
                className="text-lg px-8 py-4 shadow-2xl hover:shadow-3xl transform hover:scale-105"
              >
                <i className="ri-star-line mr-2"></i>
                Descobrir Meu Signo Verdadeiro
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
              Como funciona o quiz?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Um questionário completo que analisa sua personalidade real, não apenas sua data de nascimento
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <i className="ri-questionnaire-line text-2xl text-white"></i>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-4">25 Perguntas</h3>
              <p className="text-gray-600">
                Perguntas cuidadosamente elaboradas para descobrir traços únicos da sua personalidade
              </p>
            </Card>

            <Card className="text-center hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <i className="ri-brain-line text-2xl text-white"></i>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-4">Análise Profunda</h3>
              <p className="text-gray-600">
                Algoritmo que analisa seus comportamentos, reações e preferências pessoais
              </p>
            </Card>

            <Card className="text-center hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <i className="ri-magic-line text-2xl text-white"></i>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-4">Resultado Personalizado</h3>
              <p className="text-gray-600">
                Descubra qual signo realmente representa sua essência e personalidade única
              </p>
            </Card>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-20 px-4 bg-gradient-to-r from-purple-600 to-pink-600">
        <div className="max-w-4xl mx-auto text-center text-white">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Pronto para descobrir a verdade sobre você?
          </h2>
          <p className="text-xl mb-8 text-purple-100">
            Milhares de pessoas já descobriram seu verdadeiro signo. Agora é a sua vez!
          </p>
          <Button 
            variant="secondary"
            size="lg"
            onClick={() => navigate('/quiz')}
            className="bg-white text-purple-600 hover:bg-gray-100 shadow-xl"
          >
            <i className="ri-rocket-line mr-2"></i>
            Começar Agora - É Grátis!
          </Button>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center">
            <h3 className="text-2xl font-bold mb-4" style={{ fontFamily: '"Pacifico", serif' }}>
              Qual é o seu verdadeiro signo?
            </h3>
            <p className="text-gray-400 mb-8">
              Descubra os segredos da sua personalidade através da astrologia
            </p>
            
            <div className="border-t border-gray-800 pt-8">
              <p className="text-gray-500 text-sm">
                © 2024 Qual é o seu verdadeiro signo? Todos os direitos reservados. | 
                <a href="https://readdy.ai/?origin=logo" className="text-purple-400 hover:text-purple-300 ml-1">
                  Powered by Readdy
                </a>
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
