import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  MessageSquare, 
  Send, 
  Phone, 
  Search, 
  Filter,
  Clock,
  CheckCheck,
  Settings,
  UserPlus,
  Tag
} from "lucide-react";
import { toast } from "sonner";
import { ConfigurarWhatsAppModal } from "@/components/crm/ConfigurarWhatsAppModal";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Contact {
  id: string;
  name: string;
  phone: string;
  tags: string[];
}

interface Conversation {
  id: string;
  contact_id: string;
  status: string;
  last_message_at: string;
  unread_count: number;
  contact: Contact;
}

interface Message {
  id: string;
  content: string;
  is_from_me: boolean;
  created_at: string;
  status: string;
}

export default function CRMAtendimento() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageInput, setMessageInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [configModalOpen, setConfigModalOpen] = useState(false);
  const [whatsappConfigured, setWhatsappConfigured] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkWhatsAppConfig();
    loadConversations();
  }, []);

  useEffect(() => {
    if (selectedConversation) {
      loadMessages(selectedConversation);
      
      // Realtime subscription para novas mensagens
      const channel = supabase
        .channel(`messages-${selectedConversation}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'crm_messages',
            filter: `conversation_id=eq.${selectedConversation}`
          },
          (payload) => {
            setMessages(prev => [...prev, payload.new as Message]);
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [selectedConversation]);

  const checkWhatsAppConfig = async () => {
    try {
      const { data: profile } = await supabase
        .from("profiles")
        .select("clinic_id")
        .eq("id", (await supabase.auth.getUser()).data.user?.id)
        .single();

      if (profile?.clinic_id) {
        const { data } = await supabase
          .from("whatsapp_configs" as any)
          .select("is_active")
          .eq("clinica_id", profile.clinic_id)
          .maybeSingle();

        setWhatsappConfigured((data as any)?.is_active || false);
      }
    } catch (error) {
      console.error("Erro ao verificar config WhatsApp:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadConversations = async () => {
    try {
      const { data: profile } = await supabase
        .from("profiles")
        .select("clinic_id")
        .eq("id", (await supabase.auth.getUser()).data.user?.id)
        .single();

      if (!profile?.clinic_id) return;

      const { data, error } = await supabase
        .from("crm_conversations" as any)
        .select(`
          *,
          contact:crm_contacts(*)
        `)
        .eq("clinica_id", profile.clinic_id)
        .order("last_message_at", { ascending: false });

      if (error) throw error;
      setConversations((data as any) || []);
    } catch (error) {
      console.error("Erro ao carregar conversas:", error);
      toast.error("Erro ao carregar conversas");
    }
  };

  const loadMessages = async (conversationId: string) => {
    try {
      const { data, error } = await supabase
        .from("crm_messages" as any)
        .select("*")
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: true });

      if (error) throw error;
      setMessages((data as any) || []);

      // Marcar como lido
      await supabase
        .from("crm_conversations" as any)
        .update({ unread_count: 0 })
        .eq("id", conversationId);
    } catch (error) {
      console.error("Erro ao carregar mensagens:", error);
    }
  };

  const sendMessage = async () => {
    if (!messageInput.trim() || !selectedConversation) return;

    try {
      const { data: user } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from("crm_messages" as any)
        .insert({
          conversation_id: selectedConversation,
          content: messageInput,
          is_from_me: true,
          sender_id: user.user?.id,
          message_type: "text"
        });

      if (error) throw error;

      setMessageInput("");
      toast.success("Mensagem enviada!");
      
      // Atualizar última mensagem da conversa
      await supabase
        .from("crm_conversations" as any)
        .update({ last_message_at: new Date().toISOString() })
        .eq("id", selectedConversation);

      loadConversations();
    } catch (error) {
      console.error("Erro ao enviar mensagem:", error);
      toast.error("Erro ao enviar mensagem");
    }
  };

  const filteredConversations = conversations.filter(conv => {
    const matchesSearch = conv.contact.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         conv.contact.phone.includes(searchTerm);
    const matchesStatus = statusFilter === "all" || conv.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!whatsappConfigured) {
    return (
      <div className="container mx-auto p-6">
        <Card className="p-12 text-center">
          <MessageSquare className="w-20 h-20 mx-auto mb-6 text-muted-foreground" />
          <h2 className="text-2xl font-bold mb-4">Configure o WhatsApp Business API</h2>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            Para começar a usar o sistema de atendimento, conecte sua API do WhatsApp Business.
            Você precisará das credenciais da Meta/Facebook.
          </p>
          <Button onClick={() => setConfigModalOpen(true)} size="lg">
            <Settings className="w-4 h-4 mr-2" />
            Configurar WhatsApp
          </Button>
        </Card>

        <ConfigurarWhatsAppModal
          open={configModalOpen}
          onOpenChange={setConfigModalOpen}
          onSuccess={() => {
            setWhatsappConfigured(true);
            toast.success("WhatsApp configurado com sucesso!");
          }}
        />
      </div>
    );
  }

  const selectedConv = conversations.find(c => c.id === selectedConversation);

  return (
    <div className="flex h-[calc(100vh-4rem)] bg-background">
      {/* Sidebar - Lista de Conversas */}
      <div className="w-96 border-r flex flex-col">
        <div className="p-4 border-b space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">Atendimento</h2>
            <Button variant="ghost" size="icon" onClick={() => setConfigModalOpen(true)}>
              <Settings className="w-4 h-4" />
            </Button>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar conversas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>

          <Tabs value={statusFilter} onValueChange={setStatusFilter}>
            <TabsList className="w-full">
              <TabsTrigger value="all" className="flex-1">Todas</TabsTrigger>
              <TabsTrigger value="pending" className="flex-1">Pendentes</TabsTrigger>
              <TabsTrigger value="active" className="flex-1">Ativas</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <ScrollArea className="flex-1">
          {filteredConversations.map((conv) => (
            <div
              key={conv.id}
              onClick={() => setSelectedConversation(conv.id)}
              className={`p-4 border-b cursor-pointer hover:bg-accent transition-colors ${
                selectedConversation === conv.id ? "bg-accent" : ""
              }`}
            >
              <div className="flex items-start gap-3">
                <Avatar>
                  <AvatarFallback>
                    {conv.contact.name?.[0]?.toUpperCase() || "?"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-semibold truncate">
                      {conv.contact.name || conv.contact.phone}
                    </h3>
                    {conv.last_message_at && (
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(conv.last_message_at), "HH:mm", { locale: ptBR })}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={conv.status === "pending" ? "secondary" : "default"} className="text-xs">
                      {conv.status === "pending" ? "Pendente" : 
                       conv.status === "active" ? "Ativo" : "Fechado"}
                    </Badge>
                    {conv.unread_count > 0 && (
                      <Badge variant="destructive" className="text-xs">
                        {conv.unread_count}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </ScrollArea>
      </div>

      {/* Área de Chat */}
      <div className="flex-1 flex flex-col">
        {selectedConv ? (
          <>
            {/* Header do Chat */}
            <div className="p-4 border-b flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarFallback>
                    {selectedConv.contact.name?.[0]?.toUpperCase() || "?"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold">
                    {selectedConv.contact.name || selectedConv.contact.phone}
                  </h3>
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <Phone className="w-3 h-3" />
                    {selectedConv.contact.phone}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <UserPlus className="w-4 h-4 mr-2" />
                  Detalhes
                </Button>
                <Button variant="outline" size="sm">
                  <Tag className="w-4 h-4 mr-2" />
                  Tags
                </Button>
              </div>
            </div>

            {/* Mensagens */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.is_from_me ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[70%] rounded-lg p-3 ${
                        msg.is_from_me
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted"
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                      <div className="flex items-center justify-end gap-1 mt-1">
                        <span className="text-xs opacity-70">
                          {format(new Date(msg.created_at), "HH:mm", { locale: ptBR })}
                        </span>
                        {msg.is_from_me && (
                          <CheckCheck className="w-3 h-3 opacity-70" />
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            {/* Input de Mensagem */}
            <div className="p-4 border-t">
              <div className="flex gap-2">
                <Input
                  placeholder="Digite sua mensagem..."
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
                />
                <Button onClick={sendMessage}>
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <MessageSquare className="w-20 h-20 mx-auto mb-4 opacity-50" />
              <p>Selecione uma conversa para começar</p>
            </div>
          </div>
        )}
      </div>

      <ConfigurarWhatsAppModal
        open={configModalOpen}
        onOpenChange={setConfigModalOpen}
        onSuccess={() => {
          checkWhatsAppConfig();
          toast.success("Configurações atualizadas!");
        }}
      />
    </div>
  );
}
