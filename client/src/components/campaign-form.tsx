import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import FileUpload from "@/components/ui/file-upload";
import ImageUpload from "@/components/image-upload";
import { Upload, Users, Send, Clock, UserRound, Filter, Calendar, List } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const campaignSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  message: z.string().min(1, "Mensagem é obrigatória"),
  delayMin: z
    .number()
    .min(1, "Delay mínimo deve ser pelo menos 1 segundo")
    .default(6),
  delayMax: z
    .number()
    .min(1, "Delay máximo deve ser pelo menos 1 segundo")
    .default(12),
  batchSize: z
    .number()
    .min(1, "Tamanho do lote deve ser pelo menos 1")
    .default(10),
  batchDelay: z
    .number()
    .min(1, "Pausa entre lotes deve ser pelo menos 1 minuto")
    .default(1),
  scheduledAt: z.string().optional(),
  contactListId: z.number().optional(),
});

type CampaignFormData = z.infer<typeof campaignSchema>;

export default function CampaignForm() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [selectedContacts, setSelectedContacts] = useState<number[]>([]);
  const [step, setStep] = useState<"form" | "contacts" | "send">("form");
  const [createdCampaign, setCreatedCampaign] = useState<any>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const [daysFilter, setDaysFilter] = useState<number>(7);
  const [isFiltered, setIsFiltered] = useState<boolean>(false);

  const form = useForm<CampaignFormData>({
    resolver: zodResolver(campaignSchema),
    defaultValues: {
      name: "",
      message: "",
      delayMin: 6,
      delayMax: 12,
      batchSize: 10,
      batchDelay: 1,
      scheduledAt: "",
      contactListId: undefined,
    },
  });

  // Get user's contacts
  const { data: contacts = [], isLoading: contactsLoading } = useQuery({
    queryKey: ["/api/contacts"],
    enabled: step === "contacts",
  });

  // Upload contacts from Excel
  const uploadContactsMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);

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
      queryClient.invalidateQueries({ queryKey: ["/api/contacts"] });
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

  // Create campaign mutation
  const createCampaignMutation = useMutation({
    mutationFn: async (data: CampaignFormData) => {
      const formData = new FormData();
      formData.append("name", data.name);
      formData.append("message", data.message);
      formData.append("delayMin", data.delayMin.toString());
      formData.append("delayMax", data.delayMax.toString());
      formData.append("batchSize", data.batchSize.toString());
      formData.append("batchDelay", data.batchDelay.toString());

      if (imageFile) {
        formData.append("image", imageFile);
      }

      const response = await fetch("/api/campaigns", {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Campaign creation failed");
      }

      return response.json();
    },
    onSuccess: (campaign) => {
      setCreatedCampaign(campaign);
      setStep("contacts");
      queryClient.invalidateQueries({ queryKey: ["/api/campaigns"] });
      toast({
        title: "Campanha criada",
        description: "Campanha criada com sucesso",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Não autorizado",
          description: "Você foi desconectado. Faça login novamente...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/auth";
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

  // Send campaign mutation
  const sendCampaignMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest(
        "POST",
        `/api/campaigns/${createdCampaign.id}/send`,
        {
          contactIds: selectedContacts,
        },
      );
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/campaigns"] });
      toast({
        title: "Campanha enviada",
        description: `${data.sent} mensagens enviadas com sucesso`,
      });
      // Reset form
      setStep("form");
      setCreatedCampaign(null);
      setSelectedContacts([]);
      setImageFile(null);
      form.reset();
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Não autorizado",
          description: "Você foi desconectado. Faça login novamente...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/auth";
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

  const handleContactSelection = (contactId: number, checked: boolean) => {
    if (checked) {
      setSelectedContacts((prev) => [...prev, contactId]);
    } else {
      setSelectedContacts((prev) => prev.filter((id) => id !== contactId));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      if (isFiltered) {
        // Se filtrado, selecione apenas os contatos filtrados
        const filteredIds = filterContactsByLastSent(contacts, daysFilter).map(
          (contact: any) => contact.id,
        );
        setSelectedContacts(filteredIds);
      } else {
        // Caso contrário, selecione todos os contatos
        setSelectedContacts(contacts.map((contact: any) => contact.id));
      }
    } else {
      setSelectedContacts([]);
    }
  };

  const handleFileUpload = (file: File | null) => {
    if (file) {
      uploadContactsMutation.mutate(file);
    }
    setSelectedFile(file);
  };

  const insertNameVariable = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const currentValue = form.getValues("message");
    const newValue =
      currentValue.substring(0, start) + "[nome]" + currentValue.substring(end);

    form.setValue("message", newValue);

    // Reposiciona o cursor após a variável inserida
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + 6, start + 6);
    }, 0);
  };

  // Função para filtrar contatos que não receberam mensagens nos últimos X dias
  const filterContactsByLastSent = (contacts: any[], days: number) => {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    return contacts.filter((contact: any) => {
      // Se nunca recebeu mensagem, incluir
      if (!contact.lastCampaignSent) return true;

      // Se recebeu, verificar se foi antes da data de corte
      const lastSentDate = new Date(contact.lastCampaignSent);
      return lastSentDate < cutoffDate;
    });
  };

  // Aplicar filtro por dias
  const applyDaysFilter = () => {
    const filteredContacts = filterContactsByLastSent(contacts, daysFilter);
    setIsFiltered(true);
    // Limpa a seleção atual
    setSelectedContacts([]);
    // Opcional: selecionar automaticamente todos os contatos filtrados
    setSelectedContacts(filteredContacts.map((contact: any) => contact.id));

    toast({
      title: "Filtro aplicado",
      description: `${filteredContacts.length} contatos não receberam mensagens nos últimos ${daysFilter} dias`,
    });
  };

  // Remover filtro
  const clearFilter = () => {
    setIsFiltered(false);
    setSelectedContacts([]);
  };

  if (step === "form") {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Nova Campanha
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome da Campanha</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Digite o nome da campanha"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="message"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mensagem</FormLabel>
                    <div className="space-y-2">
                      <FormControl>
                        <Textarea
                          placeholder="Digite sua mensagem aqui. Use [nome] para personalizar com o nome do contato."
                          rows={4}
                          {...field}
                          ref={(e) => {
                            field.ref(e);
                            textareaRef.current = e;
                          }}
                        />
                      </FormControl>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={insertNameVariable}
                        className="flex items-center gap-1"
                      >
                        <UserRound size={14} />
                        Inserir [nome]
                      </Button>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div>
                <FormLabel>Imagem (opcional)</FormLabel>
                <ImageUpload
                  onImageUpload={setImageFile}
                  onImageRemove={() => setImageFile(null)}
                  imageUrl={
                    imageFile ? URL.createObjectURL(imageFile) : undefined
                  }
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="delayMin"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Delay Mínimo (seg)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          onChange={(e) =>
                            field.onChange(Number(e.target.value))
                          }
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
                      <FormLabel>Delay Máximo (seg)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          onChange={(e) =>
                            field.onChange(Number(e.target.value))
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="batchSize"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tamanho do Lote</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          onChange={(e) =>
                            field.onChange(Number(e.target.value))
                          }
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
                      <FormLabel>Pausa entre Lotes (min)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          onChange={(e) =>
                            field.onChange(Number(e.target.value))
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={createCampaignMutation.isPending}
              >
                {createCampaignMutation.isPending
                  ? "Criando..."
                  : "Criar Campanha"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    );
  }

  if (step === "contacts") {
    // Determinar quais contatos exibir com base no filtro
    const displayedContacts = isFiltered
      ? filterContactsByLastSent(contacts, daysFilter)
      : contacts;

    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Selecionar Contatos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {contacts.length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">
                  Você ainda não tem contatos cadastrados.
                </p>
                <FileUpload
                  accept=".xlsx,.xls,.csv"
                  onFileSelect={handleFileUpload}
                  selectedFile={selectedFile}
                />
                {uploadContactsMutation.isPending && (
                  <p className="text-sm text-gray-500 mt-2">
                    Carregando contatos...
                  </p>
                )}
              </div>
            )}

            {contacts.length > 0 && (
              <>
                {/* Filtro por dias desde último envio */}
                <div className="bg-gray-50 p-4 rounded-lg mb-4">
                  <h3 className="font-medium mb-2 flex items-center gap-1">
                    <Filter className="h-4 w-4" />
                    Filtrar contatos
                  </h3>
                  <div className="flex items-end gap-2">
                    <div className="flex-1">
                      <FormLabel className="text-sm">
                        Enviar apenas para contatos que não receberam nos
                        últimos:
                      </FormLabel>
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          value={daysFilter}
                          onChange={(e) =>
                            setDaysFilter(Number(e.target.value))
                          }
                          className="w-24"
                          min="1"
                        />
                        <span>dias</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={clearFilter}
                        disabled={!isFiltered}
                      >
                        Limpar
                      </Button>
                      <Button size="sm" onClick={applyDaysFilter}>
                        Aplicar
                      </Button>
                    </div>
                  </div>
                  {isFiltered && (
                    <p className="text-xs text-green-700 mt-2">
                      Mostrando {displayedContacts.length} de {contacts.length}{" "}
                      contatos que não receberam mensagens nos últimos{" "}
                      {daysFilter} dias.
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      checked={
                        selectedContacts.length === displayedContacts.length &&
                        displayedContacts.length > 0
                      }
                      onCheckedChange={handleSelectAll}
                    />
                    <span>
                      Selecionar todos ({displayedContacts.length} contatos)
                    </span>
                  </div>
                  <Badge variant="secondary">
                    {selectedContacts.length} selecionados
                  </Badge>
                </div>

                <div className="max-h-64 overflow-y-auto space-y-2">
                  {displayedContacts.map((contact: any) => (
                    <div
                      key={contact.id}
                      className="flex items-center gap-2 p-2 border rounded"
                    >
                      <Checkbox
                        checked={selectedContacts.includes(contact.id)}
                        onCheckedChange={(checked) =>
                          handleContactSelection(contact.id, checked)
                        }
                      />
                      <div className="flex-1">
                        <p className="font-medium">{contact.name}</p>
                        <p className="text-sm text-gray-500">{contact.phone}</p>
                        {contact.lastCampaignSent && (
                          <p className="text-xs text-gray-400">
                            Último envio:{" "}
                            {new Date(
                              contact.lastCampaignSent,
                            ).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setStep("form")}
                    className="flex-1"
                  >
                    Voltar
                  </Button>
                  <Button
                    onClick={() => setStep("send")}
                    disabled={selectedContacts.length === 0}
                    className="flex-1"
                  >
                    Continuar ({selectedContacts.length} contatos)
                  </Button>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (step === "send") {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Send className="w-5 h-5" />
            Enviar Campanha
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium mb-2">Resumo da Campanha</h3>
              <p>
                <strong>Nome:</strong> {createdCampaign?.name}
              </p>
              <p>
                <strong>Contatos selecionados:</strong>{" "}
                {selectedContacts.length}
              </p>
              <p>
                <strong>Delay:</strong> {form.getValues("delayMin")} -{" "}
                {form.getValues("delayMax")} segundos
              </p>
              <p>
                <strong>Lote:</strong> {form.getValues("batchSize")} mensagens
                por lote
              </p>
              <p>
                <strong>Pausa entre lotes:</strong>{" "}
                {form.getValues("batchDelay")} minutos
              </p>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-blue-800">
                <Clock className="w-4 h-4 inline mr-1" />
                Tempo estimado: {Math.ceil(
                  (selectedContacts.length * 8) / 60,
                )}{" "}
                minutos
              </p>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setStep("contacts")}
                className="flex-1"
              >
                Voltar
              </Button>
              <Button
                onClick={() => sendCampaignMutation.mutate()}
                disabled={sendCampaignMutation.isPending}
                className="flex-1"
              >
                {sendCampaignMutation.isPending
                  ? "Enviando..."
                  : "Enviar Campanha"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }
}
