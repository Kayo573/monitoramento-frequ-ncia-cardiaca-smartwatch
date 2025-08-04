const axios = require('axios');

// Configuração do CallMeBot
const API_KEY = 'SUA_API_KEY_AQUI'; // Ex: chave recebida no WhatsApp
const NUMERO_DESTINO = '+55SEUNUMEROAQUI'; // Exemplo: +5591999999999
const URL_CALLMEBOT = 'https://api.callmebot.com/whatsapp.php';

// URL da API do ThingSpeak (canal 2228913)
const URL_THINGSPEAK = 'https://api.thingspeak.com/channels/2228913/feeds.json?results=5';

// Envia alerta via WhatsApp
async function enviarAlertaViaWhatsapp(nome, sistolica, diastolica) {
  const mensagem = `⚠️ Alerta: ${nome} está com pressão alterada!\nSistólica: ${sistolica} mmHg\nDiastólica: ${diastolica} mmHg`;

  try {
    const response = await axios.get(URL_CALLMEBOT, {
      params: {
        phone: NUMERO_DESTINO,
        text: mensagem,
        apikey: API_KEY
      }
    });

    if (response.status === 200) {
      console.log('✅ Alerta enviado com sucesso via WhatsApp!');
    } else {
      console.log('❌ Erro ao enviar alerta:', response.statusText);
    }
  } catch (error) {
    console.error('❌ Erro ao conectar com CallMeBot:', error.message);
  }
}

// Consulta os dados no ThingSpeak
async function obterDadosThingSpeak() {
  try {
    const resposta = await axios.get(URL_THINGSPEAK);
    const feeds = resposta.data.feeds;

    return feeds.map(feed => ({
      nome: feed.field1 || 'Desconhecido',
      pressao_sistolica: parseInt(feed.field2) || 0,
      pressao_diastolica: parseInt(feed.field3) || 0
    }));
  } catch (error) {
    console.error('❌ Erro ao acessar ThingSpeak:', error.message);
    return [];
  }
}

// Analisa os dados
async function analisarPressao() {
  const dados = await obterDadosThingSpeak();

  for (const pessoa of dados) {
    const { nome, pressao_sistolica, pressao_diastolica } = pessoa;
    console.log(`Analisando ${nome} - ${pressao_sistolica}/${pressao_diastolica} mmHg`);

    if (
      pressao_sistolica > 140 ||
      pressao_diastolica > 90 ||
      pressao_sistolica < 90 ||
      pressao_diastolica < 60
    ) {
      await enviarAlertaViaWhatsapp(nome, pressao_sistolica, pressao_diastolica);
    } else {
      console.log('🟢 Pressão normal.\n');
    }
  }
}

// Executa o processo
analisarPressao();
