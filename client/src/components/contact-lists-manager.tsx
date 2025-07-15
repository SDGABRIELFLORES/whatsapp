import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { 
  Plus, 
  List, 
  Users, 
  Edit2, 
  Trash2, 
  Save 
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

const colors = [
  { name: "Azul", value: "blue", class: "bg-blue-100 text-blue-800" },
  { name: "Verde", value: "green", class: "bg-green-100 text-green-800" },
  { name: "Vermelho", value: "red", class: "bg-red-100 text-red-800" },
  { name: "Amarelo", value: "yellow", class: "bg-yellow-100 text-yellow-800" },
  { name: "Roxo", value: "purple", class: "bg-purple-100 text-purple-800" },
  { name: "Rosa", value: "pink", class: "bg-pink-100 text-pink-800" },
];

export default function ContactListsManager() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newListName, setNewListName] = useState("");
  const [newListDescription, setNewListDescription] = useState("");
  const [selectedColor, setSelectedColor] = useState("blue");

  // Fetch contact lists
  const { data: contactLists = [], isLoading } = useQuery({
    queryKey: ["/api/contact-lists"],
  });

  // Create contact list mutation
  const createListMutation = useMutation({
    mutationFn: async (listData: { name: string; description: string; color: string }) => {
      const res = await apiRequest("POST", "/api/contact-lists", listData);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/contact-lists"] });
      setIsCreateDialogOpen(false);
      setNewListName("");
      setNewListDescription("");
      setSelectedColor("blue");
      toast({
        title: "Lista criada",
        description: "Lista de contatos criada com sucesso!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao criar lista de contatos",
        variant: "destructive",
      });
    },
  });

  // Delete contact list mutation
  const deleteListMutation = useMutation({
    mutationFn: async (listId: number) => {
      const res = await apiRequest("DELETE", `/api/contact-lists/${listId}`);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/contact-lists"] });
      toast({
        title: "Lista excluída",
        description: "Lista de contatos excluída com sucesso!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao excluir lista de contatos",
        variant: "destructive",
      });
    },
  });

  const handleCreateList = () => {
    if (!newListName.trim()) {
      toast({
        title: "Erro",
        description: "Nome da lista é obrigatório",
        variant: "destructive",
      });
      return;
    }

    createListMutation.mutate({
      name: newListName,
      description: newListDescription,
      color: selectedColor,
    });
  };

  const getColorClass = (colorValue: string) => {
    const color = colors.find(c => c.value === colorValue);
    return color?.class || "bg-gray-100 text-gray-800";
  };

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
        <p className="text-gray-500">Carregando listas de contatos...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Listas de Contatos</h2>
          <p className="text-gray-600">Organize seus contatos em listas personalizadas</p>
        </div>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Nova Lista
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Criar Nova Lista</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Nome da Lista</label>
                <Input
                  value={newListName}
                  onChange={(e) => setNewListName(e.target.value)}
                  placeholder="Ex: Clientes Recorrentes"
                />
              </div>
              
              <div>
                <label className="text-sm font-medium">Descrição (opcional)</label>
                <Textarea
                  value={newListDescription}
                  onChange={(e) => setNewListDescription(e.target.value)}
                  placeholder="Descrição da lista..."
                />
              </div>
              
              <div>
                <label className="text-sm font-medium">Cor da Lista</label>
                <div className="grid grid-cols-3 gap-2 mt-2">
                  {colors.map((color) => (
                    <Button
                      key={color.value}
                      variant={selectedColor === color.value ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedColor(color.value)}
                      className={`${color.class} border-2 ${
                        selectedColor === color.value ? "border-black" : "border-transparent"
                      }`}
                    >
                      {color.name}
                    </Button>
                  ))}
                </div>
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setIsCreateDialogOpen(false)}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleCreateList}
                  disabled={createListMutation.isPending}
                >
                  <Save className="w-4 h-4 mr-2" />
                  {createListMutation.isPending ? "Criando..." : "Criar Lista"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {contactLists.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <List className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Nenhuma lista criada
              </h3>
              <p className="text-gray-500 mb-4">
                Crie listas para organizar seus contatos por categoria
              </p>
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Criar Primeira Lista
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {contactLists.map((list: any) => (
            <Card key={list.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Badge className={getColorClass(list.color)}>
                      <List className="w-3 h-3 mr-1" />
                      {list.name}
                    </Badge>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Button variant="ghost" size="sm">
                      <Edit2 className="w-3 h-3" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => deleteListMutation.mutate(list.id)}
                      disabled={deleteListMutation.isPending}
                    >
                      <Trash2 className="w-3 h-3 text-red-500" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {list.description && (
                    <p className="text-sm text-gray-600">{list.description}</p>
                  )}
                  <div className="flex items-center text-sm text-gray-500">
                    <Users className="w-4 h-4 mr-1" />
                    {list.contactCount || 0} contatos
                  </div>
                  <div className="text-xs text-gray-400">
                    Criada em {new Date(list.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}