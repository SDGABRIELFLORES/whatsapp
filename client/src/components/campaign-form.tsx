import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import FileUpload from "@/components/ui/file-upload";

const campaignSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  message: z.string().min(1, "Mensagem é obrigatória"),
  imageUrl: z.string().optional(),
  delayMin: z.number().min(1, "Delay mínimo deve ser pelo menos 1 segundo").default(6),
  delayMax: z.number().min(1, "Delay máximo deve ser pelo menos 1 segundo").default(12),
  batchSize: z.number().min(1, "Tamanho do lote deve ser pelo menos 1").default(10),
  batchDelay: z.number().min(1, "Pausa entre lotes deve ser pelo menos 1 minuto").default(1),
});

type CampaignFormData = z.infer<typeof campaignSchema>;

export default function CampaignForm() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadedContacts, setUploadedContacts] = useState<any[]>([]);

  const form = useForm<CampaignFormData>({
    resolver: zodResolver(campaignSchema),
    defaultValues: {
      name: "",
      message: "",
      imageUrl: "",
      delayMin: 6,
      delayMax: 12,
      batchSize: 10,
      batchDelay: 1,
    },
  });

  // Create campaign mutation
  const createCampaignMutation = useMutation({
    mutationFn: async (data: CampaignFormData) => {
      const response = await apiRequest("POST", "/api/campaigns", data);
      return response.json();
    },
    onSuccess: (campaign) => {
      queryClient.invalidateQueries({ queryKey: ["/api/campaigns"] });
      toast({
        title: "Campanha criada",
        description: "Campanha criada com sucesso",
      });
      
      // Upload contacts if file is selected
      if (selectedFile) {
        uploadContactsMutation.mutate({ file: selectedFile, campaignId: campaign.id });
      }
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Erro",
        description: "Erro ao criar campanha",
        variant: "destructive",
      });
    },
  });

  // Upload contacts mutation
  const uploadContactsMutation = useMutation({
    mutationFn: async ({ file, campaignId }: { file: File; campaignId: number }) => {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("campaignId", campaignId.toString());
      
      const response = await fetch("/api/contacts/upload", {
        method: "POST",
        body: formData,
        credentials: "include",
      });
      
      if (!response.ok) {
        throw new Error("Upload failed");
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      setUploadedContacts(data.contacts);
      toast({
        title: "Contatos carregados",
        description: `${data.total} contatos carregados com sucesso`,
      });
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: "Erro ao carregar contatos",
        variant: "destructive",
      });
    },
  });

  // Send campaign mutation
  const sendCampaignMutation = useMutation({
    mutationFn: async (campaignId: number) => {
      const response = await apiRequest("POST", `/api/campaigns/${campaignId}/send`);
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/campaigns"] });
      toast({
        title: "Campanha enviada",
        description: `${data.sent} mensagens enviadas com sucesso`,
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Erro",
        description: "Erro ao enviar campanha",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: CampaignFormData) => {
    createCampaignMutation.mutate(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome da Campanha</FormLabel>
              <FormControl>
                <Input placeholder="Digite o nome da campanha" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* File Upload */}
        <div className="space-y-2">
          <FormLabel>Upload de Planilha</FormLabel>
          <FileUpload
            accept=".xlsx,.xls"
            onFileSelect={setSelectedFile}
            selectedFile={selectedFile}
          />
          <FormDescription>
            Formatos suportados: .xlsx, .xls. A planilha deve conter colunas 'nome' e 'numero'.
          </FormDescription>
        </div>

        <FormField
          control={form.control}
          name="message"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Mensagem</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Olá [nome], tudo bem? Esta é uma mensagem personalizada..."
                  rows={4}
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Use [nome] para personalizar a mensagem com o nome do contato
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="imageUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>URL da Imagem (Opcional)</FormLabel>
              <FormControl>
                <Input placeholder="https://exemplo.com/imagem.jpg" {...field} />
              </FormControl>
              <FormDescription>
                URL da imagem que será enviada junto com a mensagem
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Anti-Ban Settings */}
        <Card>
          <CardContent className="pt-6">
            <h4 className="text-sm font-medium text-slate-700 mb-4">
              Configurações Anti-Ban
            </h4>
            <div className="grid md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="delayMin"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Delay Mínimo (segundos)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="delayMax"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Delay Máximo (segundos)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="batchSize"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Lote de Mensagens</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="batchDelay"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Pausa entre Lotes (minutos)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end space-x-4">
          <Button type="button" variant="outline">
            Salvar Rascunho
          </Button>
          <Button 
            type="submit" 
            disabled={createCampaignMutation.isPending}
            className="bg-primary text-white hover:bg-primary/90"
          >
            {createCampaignMutation.isPending ? "Criando..." : "Criar Campanha"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
