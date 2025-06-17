<template>
  <div class="flex h-screen bg-[#ece5dd]">
    <Loading :is-loading="isLoading" />
    <!-- Sidebar -->
    <aside
      :class="{
        'w-90': isMobile && sidebarOpen,
        'w-60': !isMobile || sidebarOpen,
        'transform translate-x--10': sidebarOpen && isMobile,
        'transform -translate-x-full': !sidebarOpen && isMobile,
      }"
      class="transition-all bg-[#075e54] border border-white dark:bg-gray-900 text-white fixed md:relative ove z-50 h-full"
    >
      <div class="p-4 border-b border-gray-100">
        <input
          type="text"
          placeholder="Search or start a new chat"
          v-model="search"
          class="w-full rounded-full border border-gray-300 px-4 py-2 text-sm focus:outline-none"
        />
      </div>
      <ul class="flex-1 overflow-y-auto list-none m-0 p-0">
        <li
          v-for="chat in filteredChats"
          :key="chat.id"
          @click="selectChat(chat)"
          class="flex items-center px-4 py-3 cursor-pointer border-b border-gray-100 hover:bg-gray-400 dark:hover:bg-gray-800 transition-colors"
        >
          <img :src="chat.avatar" class="w-10 h-10 rounded-full mr-4" />
          <div>
            <div class="font-semibold text-sm">{{ chat.name }}</div>
            <div class="text-xs text-gray-100 truncate max-w-[160px]">
              {{ chat.content || chat.lastMessage?.text || "" }}
            </div>
          </div>
        </li>
      </ul>
    </aside>

    <!-- Main content area -->
    <main class="flex-1 flex flex-col h-full overflow-hidden">
      <!-- Header -->
      <header
        class="bg-[#075e54] dark:bg-gray-900 border border-white text-white p-4 flex items-center sticky top-0 z-40"
      >
        <!-- Make header sticky -->
        <button
          class="mr-4 text-2xl items-center md:hidden"
          v-if="isMobile"
          @click="sidebarOpen = !sidebarOpen"
        >
          ←
        </button>
        <span v-if="selectedChat" class="font-semibold">
          {{ selectedChat.name }}
        </span>
      </header>

      <!-- Chat content -->
      <section
        v-if="selectedChat"
        class="flex-1 p-4 overflow-y-auto bg-[#ece5dd] dark:text-white dark:bg-gray-900 flex flex-col gap-2"
        style="max-height: calc(100vh - 140px)"
      >
        <div
          v-for="msg in selectedChat?.messages || []"
          :key="msg.id"
          :class="{
            'max-w-[60%] px-4 py-2 rounded-lg shadow-sm': true,
            'bg-[#dcf8c6] dark:bg-blue-600   self-end': msg.fromMe,
            'bg-white dark:bg-cyan-500 self-start': !msg.fromMe,
            'opacity-50': msg.status === 'sending',
          }"
        >
          {{ msg.text }}
          <div v-if="msg.status === 'sending'" class="text-xs text-gray-500">
            Sending...
          </div>
          <div class="text-xs">
            {{ formatTime(msg.createdAt) }}
          </div>
        </div>
      </section>

      <!-- Footer input area -->
      <footer
        v-if="selectedChat"
        class="flex p-5 bg-gray-50 dark:bg-gray-900 border-t sticky bottom-0 z-40"
      >
        <input
          v-model="newMessage"
          @keyup.enter="sendMessage"
          placeholder="Type a message"
          class="flex-1 rounded-full border border-gray-300 px-4 py-2 mr-2 text-sm focus:outline-none"
        />
        <button
          @click="sendMessage"
          class="bg-[#075e54] text-white cursor-pointer rounded-full px-6 py-2 font-semibold"
        >
          Send
        </button>
      </footer>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from "vue";
import { useAuthStore } from "../stores/store";
import axios from "axios";
import socket from "../utils/socket";
import { formatTime } from "@/utils/utils";
import Loading from "@/components/Loading.vue";

const isLoading = ref(false);
const search = ref("");
const chats = ref([]);
const selectedChat = ref(null);
const newMessage = ref("");
const isMobile = ref(false);
const sidebarOpen = ref(true); // Open sidebar by default on mobile
const authStore = useAuthStore();
const user = computed(() => authStore.user);

const filteredChats = computed(() => {
  return chats.value.filter((chat) =>
    chat.name.toLowerCase().includes(search.value.toLowerCase())
  );
});

async function fetchChats() {
  if (!user.value) return;
  isLoading.value = true;
  try {
    if (user.value.role === "ADMIN") {
      const res = await axios.get("/api/user/all", { withCredentials: true });
      chats.value = res.data
        .filter((u) => u.id !== user.value.id)
        .map((u) => ({
          id: u.id,
          name: u.username,
          avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(
            u.username
          )}`,
          messages: [],
          lastMessage: null,
        }));
    } else {
      chats.value = [
        {
          id: 1,
          name: "admin",
          avatar: `https://ui-avatars.com/api/?name=admin`,
          messages: [],
          lastMessage: null,
        },
      ];
    }
    if (chats.value.length > 0) {
      selectChat(chats.value[0]);
    }
  } catch (err) {
    console.error("Error fetching chats:", err);
  } finally {
    isLoading.value = false;
  }
}

function selectChat(chat) {
  selectedChat.value = chat;
  fetchMessages(chat.id);
  if (isMobile.value) {
    sidebarOpen.value = false; // Close sidebar on mobile when a chat is selected
  }
}

async function fetchMessages(chatUserId) {
  try {
    const payload = {
      senderId: user.value.id,
      receiverId: chatUserId,
    };

    const res = await axios.get(`/api/chat/history`, {
      params: payload,
      withCredentials: true,
    });
    if (selectedChat.value) {
      selectedChat.value.messages = res.data.map((msg) => ({
        id: msg.id,
        text: msg.content,
        fromMe: msg.senderId === user.value.id,
        status: "received",
        senderId: msg.senderId,
        receiverId: msg.receiverId,
        createdAt: msg.createdAt,
      }));

      selectedChat.value.lastMessage = {
        text: res.data[res.data.length - 1].content,
        from: res.data[res.data.length - 1].senderId,
        to: res.data[res.data.length - 1].receiverId,
        createdAt: res.data[res.data.length - 1].createdAt,
      };
    }
  } catch (err) {
    console.error("Error fetching messages:", err);
  }
}

async function sendMessage() {
  if (newMessage.value.trim() && selectedChat.value) {
    const payload = {
      senderId: user.value.id,
      receiverId: selectedChat.value.id,
      content: newMessage.value,
    };

    selectedChat.value.messages.push({
      id: Date.now(),
      text: newMessage.value,
      fromMe: true,
      status: "sending",
      senderId: user.value.id,
      receiverId: selectedChat.value.id,
      createdAt: new Date().toISOString(),
    });

    selectedChat.value.lastMessage = {
      text: newMessage.value,
      from: user.value.id,
      to: selectedChat.value.id,
    };

    try {
      await axios.post("/api/chat/send", payload, { withCredentials: true });
      const lastMessage =
        selectedChat.value.messages[selectedChat.value.messages.length - 1];
      lastMessage.status = "sent";
      socket.emit("private message", {
        to: selectedChat.value.id,
        message: newMessage.value,
        from: user.value.id,
      });
      newMessage.value = "";
    } catch (err) {
      console.error("Error sending message:", err);
    }
  }
}

function handleNewMessage(data) {
  const { from, message } = data;

  if (selectedChat.value && selectedChat.value.id === from) {
    selectedChat.value.messages.push({
      id: Date.now(),
      text: message,
      fromMe: false,
      status: "received",
      senderId: from,
      receiverId: user.value.id,
      createdAt: new Date().toISOString(),
    });

    selectedChat.value.lastMessage = {
      text: message,
      from: from,
      to: user.value.id,
    };
  }
}

function handleResize() {
  isMobile.value = window.innerWidth <= 768;
}

onMounted(async () => {
  handleResize();
  window.addEventListener("resize", handleResize);
  await fetchChats();
  if (user.value) {
    socket.emit("register", user.value.id);
    socket.on("new_message", handleNewMessage);
  }
});

onBeforeUnmount(() => {
  window.removeEventListener("resize", handleResize);
  socket.off("new_message", handleNewMessage);
});
</script>
