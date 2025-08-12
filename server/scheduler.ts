import cron from "node-cron";
import { config } from "dotenv";

// Carregar variáveis de ambiente
config();

const SCHEDULER_SECRET_TOKEN = process.env.SCHEDULER_SECRET_TOKEN;
const API_URL = process.env.API_URL || "http://localhost:3000";

if (!SCHEDULER_SECRET_TOKEN) {
  console.warn(
    "SCHEDULER_SECRET_TOKEN não definido no arquivo .env. O scheduler não funcionará corretamente.",
  );
}

// Função para processar campanhas agendadas
async function processScheduledCampaigns() {
  try {
    console.log("Verificando campanhas agendadas...");

    const response = await fetch(`${API_URL}/api/campaigns/process-scheduled`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${SCHEDULER_SECRET_TOKEN}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Erro ao processar campanhas: ${response.status} - ${errorText}`,
      );
    }

    const result = await response.json();

    console.log(
      `Processamento concluído: ${result.processed} de ${result.total} campanhas processadas`,
    );
  } catch (error) {
    console.error("Erro ao chamar API para processar campanhas:", error);
  }
}

// Agendar execução a cada 5 minutos
let schedulerJob: cron.ScheduledTask;

export function initScheduler() {
  // Cancelar job anterior se existir
  if (schedulerJob) {
    schedulerJob.stop();
  }

  // Agendar para cada 5 minutos
  schedulerJob = cron.schedule("*/5 * * * *", processScheduledCampaigns);

  // Executa imediatamente na inicialização
  processScheduledCampaigns();

  console.log(
    "Scheduler inicializado: verificando campanhas agendadas a cada 5 minutos",
  );
  return schedulerJob;
}
