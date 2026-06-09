const fs = require('fs');
const path = require('path');
const projectDir = 'c:/Users/Ksa/Downloads/Khronos Serviços';

const { createClient } = require(path.join(projectDir, 'node_modules/@supabase/supabase-js'));

// Read env.local
const envFile = fs.readFileSync(path.join(projectDir, '.env.local'), 'utf-8');
const envVars = {};
envFile.split('\n').forEach(line => {
  const parts = line.split('=');
  if (parts.length >= 2) {
    const key = parts[0].trim();
    const val = parts.slice(1).join('=').trim();
    envVars[key] = val;
  }
});

const supabaseUrl = envVars.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = envVars.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Error: Supabase environment variables not loaded.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const EV_SERVICE = {
  id: 'mobilidade_eletrica',
  title: 'Carregamento Veicular',
  image: '/images/carregamento_ev.png',
  icon: 'Zap',
  href: '/mobilidade-eletrica',
  description: 'Instalação e homologação de carregadores veiculares inteligentes para condomínios, apartamentos e residências.',
  subpage_image: '/images/carregamento_ev.png',
  differentials_title: 'Diferenciais do Serviço:',
  differentials: [
    'Projetos de infraestrutura aprovados na concessionária',
    'Carregadores inteligentes com balanceamento dinâmico de carga',
    'Gestão de rateio e cobrança individual por aplicativo',
    'Instalação 100% segura com engenharia especializada Khronos'
  ],
  hidden: false
};

async function addEVService() {
  try {
    console.log('Fetching existing services from Supabase...');
    const { data, error } = await supabase
      .from('site_settings')
      .select('value')
      .eq('key', 'services')
      .maybeSingle();

    if (error) {
      console.error('Error fetching settings:', error);
      process.exit(1);
    }

    let services = [];

    if (data && Array.isArray(data.value)) {
      services = data.value;
      console.log(`Found ${services.length} services in database.`);
      
      const existingIdx = services.findIndex(s => s.id === EV_SERVICE.id);
      
      if (existingIdx >= 0) {
        console.log('EV Charging service already exists in database. Updating details...');
        services[existingIdx] = { ...EV_SERVICE, ...services[existingIdx] };
      } else {
        console.log('EV Charging service not found. Inserting in matching order...');
        // Insert after 'controle_acesso' if found, otherwise insert before 'ar_condicionado', otherwise push
        const insertionIdx = services.findIndex(s => s.id === 'controle_acesso');
        if (insertionIdx >= 0) {
          services.splice(insertionIdx + 1, 0, EV_SERVICE);
        } else {
          const arIdx = services.findIndex(s => s.id === 'ar_condicionado');
          if (arIdx >= 0) {
            services.splice(arIdx, 0, EV_SERVICE);
          } else {
            services.push(EV_SERVICE);
          }
        }
      }
    } else {
      console.log('No services row found in database or invalid format. Creating defaults...');
      // Fallback: If no settings row is found, we should query or use a baseline and insert EV service
      // For this script, we'll initialize with defaults including EV service.
      services = [
        {
          id: 'limpeza_solar',
          title: 'Limpeza Técnica de Placas',
          image: '/images/limpeza.png',
          icon: 'Sun',
          href: '/calculadora',
          description: 'Descubra quanto você está deixando de ganhar por causa da sujeira nos seus painéis solares.',
          subpage_image: '/images/limpeza.png',
          differentials_title: 'Diferenciais do Serviço:',
          differentials: [
            'Aumento imediato de até 25% na geração',
            'Prevenção de danos permanentes (hotspots)',
            'Uso de água desmineralizada e produtos corretos',
            'Equipe certificada para trabalho em altura (NR35)'
          ],
          hidden: false
        },
        {
          id: 'instalacao_manutencao',
          title: 'Instalação e Manutenção',
          image: '/images/instalacao.png',
          icon: 'Wrench',
          href: '/instalacao',
          description: 'Projetos de energia solar de alta performance, desde a homologação até o monitoramento ativo.',
          subpage_image: '/images/instalacao.png',
          differentials_title: 'O que garantimos:',
          differentials: [
            'Projetos assinados por Engenheiros Homologados',
            'Uso de materiais de primeira linha (Tier 1)',
            'Pós-venda e monitoramento ativo pelo Grupo Khronos',
            'Instalação rápida e com limpeza total'
          ],
          hidden: false
        },
        {
          id: 'automacao_residencial',
          title: 'Automação Residencial',
          image: '/images/automacao_residencial.png',
          icon: 'Cpu',
          href: '/automacao-residencial',
          description: 'Sistemas completos de automação residencial. Controle iluminação, som, persianas e climatização de forma inteligente e integrada.',
          subpage_image: '/images/automacao_residencial.png',
          differentials_title: 'O que garantimos:',
          differentials: [
            'Projetos personalizados e integração inteligente de sistemas',
            'Controle unificado via smartphone, tablet ou assistente de voz',
            'Automação de iluminação cênica, persianas e climatização',
            'Sonorização multiroom e home theater de alta fidelidade'
          ],
          hidden: false
        },
        {
          id: 'aquecimento_piso',
          title: 'Aquecimento de Piso Premium',
          image: '/images/aquecimento.png',
          icon: 'ThermometerSun',
          href: '/aquecimento',
          description: 'O máximo conforto térmico para sua casa com tecnologia de ponta e instalação auditada pela Khronos.',
          subpage_image: '/images/aquecimento.png',
          differentials_title: 'Diferenciais do Hub:',
          differentials: [
            'Sistemas de alta eficiência e baixo consumo',
            'Instalação especializada sem sujeira',
            'Controle total via smartphone',
            'Garantia estendida via Khronos'
          ],
          hidden: false
        },
        {
          id: 'controle_acesso',
          title: 'Controle de Acesso',
          image: '/images/controle_acesso.png',
          icon: 'Fingerprint',
          href: '/controle-acesso',
          description: 'Sistemas inteligentes de identificação, biometria e controle de fluxo para condomínios e empresas.',
          subpage_image: '/images/controle_acesso.png',
          differentials_title: 'Diferenciais do Serviço:',
          differentials: [
            'Reconhecimento facial e biometria de última geração',
            'Integração com sistemas de segurança e portaria',
            'Controle de fluxo de pedestres e veículos por aplicativo',
            'Suporte técnico 24h e manutenção preventiva'
          ],
          hidden: false
        },
        EV_SERVICE,
        {
          id: 'ar_condicionado',
          title: 'Instalação e Manutenção de Ar Condicionado',
          image: '/images/ar_condicionado.png',
          icon: 'Snowflake',
          href: '/ar-condicionado',
          description: 'Projetos de climatização residencial e comercial, higienização profissional e carga de gás com garantia.',
          subpage_image: '/images/ar_condicionado.png',
          differentials_title: 'Diferenciais do Serviço:',
          differentials: [
            'Técnicos certificados e credenciados pelos fabricantes',
            'Higienização completa para eliminação de fungos e bactérias',
            'Dimensionamento térmico exato para economia de energia',
            'Instalação rápida que mantém a garantia de fábrica'
          ],
          hidden: false
        }
      ];
    }

    console.log('Saving updated services to database...');
    const { error: upsertError } = await supabase
      .from('site_settings')
      .upsert({ key: 'services', value: services });

    if (upsertError) {
      console.error('Error saving to Supabase:', upsertError);
    } else {
      console.log('Database successfully updated! Electric Mobility service is now live.');
    }
  } catch (err) {
    console.error('Unexpected error:', err);
  }
}

addEVService();
