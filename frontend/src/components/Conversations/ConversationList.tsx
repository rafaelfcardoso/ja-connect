
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Message = {
  id: string;
  content: string;
  sender: "user" | "ai" | "system";
  timestamp: string;
};

type Conversation = {
  id: string;
  contact: {
    name: string;
    phone: string;
    avatar?: string;
  };
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  status: "qualificado" | "nao-qualificado" | "em-andamento";
  messages: Message[];
  qualificationScore?: number;
};

// Dados de exemplo
const conversations: Conversation[] = [
  {
    id: "1",
    contact: {
      name: "Maria Silva",
      phone: "+55 11 98765-4321",
    },
    lastMessage: "Sim, tenho interesse em consultar sobre minha aposentadoria.",
    lastMessageTime: "10:45",
    unreadCount: 2,
    status: "qualificado",
    qualificationScore: 85,
    messages: [
      {
        id: "m1",
        content: "Olá! Sou a assistente virtual do escritório LexGo. Como posso te ajudar hoje?",
        sender: "ai",
        timestamp: "10:30",
      },
      {
        id: "m2",
        content: "Oi, gostaria de saber sobre aposentadoria por idade.",
        sender: "user",
        timestamp: "10:32",
      },
      {
        id: "m3",
        content: "Claro! Para analisar seu caso, preciso de algumas informações. Você já tem quantos anos de contribuição ao INSS?",
        sender: "ai",
        timestamp: "10:33",
      },
      {
        id: "m4",
        content: "Tenho 25 anos de contribuição e 62 anos de idade.",
        sender: "user",
        timestamp: "10:40",
      },
      {
        id: "m5",
        content: "Ótimo! Com base nesses dados, você provavelmente tem direito à aposentadoria por idade. Gostaria de agendar uma consulta com um de nossos especialistas?",
        sender: "ai",
        timestamp: "10:42",
      },
      {
        id: "m6",
        content: "Sim, tenho interesse em consultar sobre minha aposentadoria.",
        sender: "user",
        timestamp: "10:45",
      },
    ],
  },
  {
    id: "2",
    contact: {
      name: "João Pereira",
      phone: "+55 11 91234-5678",
    },
    lastMessage: "Não consigo encontrar meus documentos de contribuição.",
    lastMessageTime: "09:15",
    unreadCount: 0,
    status: "em-andamento",
    messages: [
      {
        id: "m1",
        content: "Olá! Sou a assistente virtual do escritório LexGo. Como posso te ajudar hoje?",
        sender: "ai",
        timestamp: "09:00",
      },
      {
        id: "m2",
        content: "Preciso revisar meu benefício, acho que estou recebendo menos do que deveria.",
        sender: "user",
        timestamp: "09:05",
      },
      {
        id: "m3",
        content: "Entendi. Para analisarmos seu caso, precisamos de alguns documentos. Você tem em mãos sua carta de concessão do benefício?",
        sender: "ai",
        timestamp: "09:07",
      },
      {
        id: "m4",
        content: "Não consigo encontrar meus documentos de contribuição.",
        sender: "user",
        timestamp: "09:15",
      },
    ],
  },
  {
    id: "3",
    contact: {
      name: "Carlos Andrade",
      phone: "+55 11 99876-5432",
    },
    lastMessage: "Não tenho interesse no momento, obrigado.",
    lastMessageTime: "Ontem",
    unreadCount: 0,
    status: "nao-qualificado",
    qualificationScore: 25,
    messages: [
      {
        id: "m1",
        content: "Olá! Sou a assistente virtual do escritório LexGo. Como posso te ajudar hoje?",
        sender: "ai",
        timestamp: "Ontem, 14:20",
      },
      {
        id: "m2",
        content: "O que vocês fazem?",
        sender: "user",
        timestamp: "Ontem, 14:25",
      },
      {
        id: "m3",
        content: "Somos especializados em direito previdenciário. Ajudamos pessoas a conquistarem seus direitos junto ao INSS, como aposentadorias, pensões e benefícios assistenciais. Posso te ajudar com alguma questão específica?",
        sender: "ai",
        timestamp: "Ontem, 14:27",
      },
      {
        id: "m4",
        content: "Não tenho interesse no momento, obrigado.",
        sender: "user",
        timestamp: "Ontem, 14:30",
      },
    ],
  },
];

function ConversationItem({ conversation, selectedId, onSelect }: { 
  conversation: Conversation;
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  const isSelected = selectedId === conversation.id;
  
  return (
    <div 
      className={`p-3 border-b cursor-pointer ${
        isSelected ? "bg-lexgo-50" : "hover:bg-gray-50"
      }`}
      onClick={() => onSelect(conversation.id)}
    >
      <div className="flex justify-between items-start mb-1">
        <div className="flex items-center">
          <div className="h-9 w-9 rounded-full bg-lexgo-200 flex items-center justify-center mr-3">
            <span className="text-lexgo-700 font-medium">
              {conversation.contact.name
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </span>
          </div>
          <div>
            <h3 className="font-medium text-sm">{conversation.contact.name}</h3>
            <p className="text-xs text-muted-foreground">{conversation.contact.phone}</p>
          </div>
        </div>
        <div className="text-xs text-muted-foreground">{conversation.lastMessageTime}</div>
      </div>
      
      <div className="flex justify-between items-center">
        <p className="text-xs text-muted-foreground truncate max-w-[200px]">
          {conversation.lastMessage}
        </p>
        
        {conversation.unreadCount > 0 && (
          <span className="bg-lexgo-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {conversation.unreadCount}
          </span>
        )}
      </div>
      
      <div className="mt-1.5 flex items-center">
        {conversation.status === "qualificado" && (
          <span className="text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full flex items-center">
            <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1"></span>
            Qualificado
            {conversation.qualificationScore && (
              <span className="ml-1 font-medium">{conversation.qualificationScore}%</span>
            )}
          </span>
        )}
        
        {conversation.status === "nao-qualificado" && (
          <span className="text-[10px] bg-red-100 text-red-700 px-1.5 py-0.5 rounded-full flex items-center">
            <span className="w-1.5 h-1.5 bg-red-500 rounded-full mr-1"></span>
            Não Qualificado
            {conversation.qualificationScore && (
              <span className="ml-1 font-medium">{conversation.qualificationScore}%</span>
            )}
          </span>
        )}
        
        {conversation.status === "em-andamento" && (
          <span className="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full flex items-center">
            <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-1"></span>
            Em Análise
          </span>
        )}
      </div>
    </div>
  );
}

function ConversationDetail({ conversation }: { conversation: Conversation }) {
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center p-3 border-b">
        <div className="h-10 w-10 rounded-full bg-lexgo-200 flex items-center justify-center mr-3">
          <span className="text-lexgo-700 font-medium">
            {conversation.contact.name
              .split(" ")
              .map((n) => n[0])
              .join("")}
          </span>
        </div>
        <div>
          <h3 className="font-medium">{conversation.contact.name}</h3>
          <p className="text-xs text-muted-foreground">{conversation.contact.phone}</p>
        </div>
        <div className="ml-auto">
          {conversation.status === "qualificado" && (
            <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full flex items-center">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1"></span>
              Qualificado
              {conversation.qualificationScore && (
                <span className="ml-1 font-medium">{conversation.qualificationScore}%</span>
              )}
            </span>
          )}
          
          {conversation.status === "nao-qualificado" && (
            <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full flex items-center">
              <span className="w-1.5 h-1.5 bg-red-500 rounded-full mr-1"></span>
              Não Qualificado
              {conversation.qualificationScore && (
                <span className="ml-1 font-medium">{conversation.qualificationScore}%</span>
              )}
            </span>
          )}
          
          {conversation.status === "em-andamento" && (
            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full flex items-center">
              <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-1"></span>
              Em Análise
            </span>
          )}
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {conversation.messages.map((message) => (
          <div
            key={message.id}
            className={`max-w-[80%] p-3 rounded-xl ${
              message.sender === "user"
                ? "ml-auto bg-lexgo-500 text-white rounded-br-none"
                : message.sender === "ai"
                ? "mr-auto bg-gray-100 text-gray-800 rounded-bl-none"
                : "mx-auto bg-muted text-muted-foreground text-xs py-1"
            }`}
          >
            <div className="text-sm">{message.content}</div>
            <div className={`text-[10px] mt-1 ${
              message.sender === "user" ? "text-white/70" : "text-gray-500"
            }`}>
              {message.timestamp}
            </div>
          </div>
        ))}
      </div>
      
      <div className="border-t p-3 flex items-center gap-2">
        <button className="p-2 text-muted-foreground hover:text-foreground rounded-full hover:bg-muted">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="20" 
            height="20" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          >
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
            <polyline points="15 3 21 3 21 9"></polyline>
            <line x1="10" y1="14" x2="21" y2="3"></line>
          </svg>
        </button>
        <input 
          type="text" 
          className="flex-1 border rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-lexgo-500"
          placeholder="Enviar mensagem..."
        />
        <button className="bg-lexgo-500 text-white p-2 rounded-full hover:bg-lexgo-600">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="20" 
            height="20" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          >
            <line x1="22" y1="2" x2="11" y2="13"></line>
            <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
          </svg>
        </button>
      </div>
    </div>
  );
}

export default function ConversationList() {
  const [selectedConversation, setSelectedConversation] = React.useState<string>("1");
  
  const conversation = conversations.find(c => c.id === selectedConversation);
  
  return (
    <Card className="h-[calc(100vh-120px)]">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium">Conversas WhatsApp</CardTitle>
      </CardHeader>
      <CardContent className="p-0 h-[calc(100%-60px)]">
        <div className="flex h-full">
          <div className="w-[350px] border-r overflow-y-auto">
            <div className="p-2 border-b">
              <input 
                type="text" 
                className="w-full border rounded-full px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-lexgo-500"
                placeholder="Buscar conversa..."
              />
            </div>
            
            {conversations.map((conversation) => (
              <ConversationItem 
                key={conversation.id} 
                conversation={conversation}
                selectedId={selectedConversation}
                onSelect={setSelectedConversation}
              />
            ))}
          </div>
          
          <div className="flex-1">
            {conversation ? (
              <ConversationDetail conversation={conversation} />
            ) : (
              <div className="h-full flex items-center justify-center">
                <div className="text-center">
                  <p className="text-muted-foreground">
                    Selecione uma conversa para ver os detalhes
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
