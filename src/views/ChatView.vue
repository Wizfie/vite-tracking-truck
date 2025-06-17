<template>
  <div class="flex h-screen bg-[#ece5dd]">
    <aside :class="classAside">
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
          class="flex items-center px-4 py-3 cursor-pointer border-b border-gray-100 hover:bg-gray-50"
        >
          <img :src="chat.avatar" class="w-10 h-10 rounded-full mr-4" />
          <div>
            <div class="font-semibold text-sm">{{ chat.name }}</div>
            <div class="text-xs text-gray-500 truncate max-w-[160px]">
              {{ chat.lastMessage }}
            </div>
          </div>
        </li>
      </ul>
    </aside>
    <main class="flex-1 flex flex-col">
      <header class="bg-[#075e54] text-white p-4 flex items-center">
        <button
          class="mr-4 text-2xl md:hidden"
          v-if="isMobile"
          @click="sidebarOpen = !sidebarOpen"
        >
          ☰
        </button>
        <span v-if="selectedChat" class="font-semibold">
          {{ selectedChat.name }}
        </span>
      </header>
      <section
        class="flex-1 p-4 overflow-y-auto bg-[#ece5dd] flex flex-col gap-2"
      >
        <div
          v-for="msg in selectedChat?.messages || []"
          :key="msg.id"
          :class="{
            'max-w-[60%] px-4 py-2 rounded-lg shadow-sm': true,
            'bg-[#dcf8c6] self-end': msg.fromMe,
            'bg-white self-start': !msg.fromMe,
            'opacity-50': msg.status === 'sending',
          }"
        >
          {{ msg.text }}
          <div v-if="msg.status === 'sending'" class="text-xs text-gray-500">
            Sending...
          </div>
        </div>
      </section>
      <footer class="flex p-4 bg-gray-50 border-t border-gray-100">
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
import { ref, computed, onMounted, onBeforeUnmount, nextTick } from "vue";
import { useAuthStore } from "../stores/store";
import axios from "axios";
import socket from "../utils/socket"; // Pastikan ini mengimpor socket.io-client

const search = ref("");
const chats = ref([]);
const selectedChat = ref(null);
const newMessage = ref("");
const sidebarOpen = ref(false);
const isMobile = ref(false);
const authStore = useAuthStore();
const user = computed(() => authStore.user);

const filteredChats = computed(() =>
  chats.value.filter((chat) =>
    chat.name.toLowerCase().includes(search.value.toLowerCase())
  )
);

const classAside = computed(() => {
  if (isMobile.value) {
    return [
      "flex flex-col border-r border-gray-200 bg-white transition-all fixed z-10 w-4/5 max-w-xs top-16 left-0 bottom-4 shadow-lg",
      sidebarOpen.value ? "block" : "hidden",
    ].join(" ");
  }
  return "flex flex-col border-r border-gray-200 bg-white transition-all w-80";
});

function selectChat(chat) {
  selectedChat.value = chat;
  if (isMobile.value) sidebarOpen.value = false;
  fetchMessages(chat.id);
}

async function fetchChats() {
  if (!user.value) return;
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
        }));
    } else {
      chats.value = [
        {
          id: 1, // id admin, bisa juga diambil dari config/global jika multi admin
          name: "admin",
          avatar: `https://ui-avatars.com/api/?name=admin`,
          messages: [],
        },
      ];
    }
    if (chats.value.length > 0) {
      selectChat(chats.value[0]);
    }
  } catch (err) {
    console.error("Error fetching chats:", err);
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
      }));
    }
  } catch (err) {
    if (err.response && err.response.status === 404) {
      if (selectedChat.value) selectedChat.value.messages = [];
    } else {
      console.error("Error fetching messages:", err);
    }
  }
}

async function sendMessage() {
  if (newMessage.value.trim() && selectedChat.value) {
    const payload = {
      senderId: user.value.id,
      receiverId: selectedChat.value.id,
      content: newMessage.value,
    };

    const tempMessage = {
      id: Date.now(),
      text: newMessage.value,
      fromMe: true,
      status: "sending", // Status awal adalah "sending"
    };

    selectedChat.value.messages.push(tempMessage);
    newMessage.value = "";

    try {
      const res = await axios.post("/api/chat/send", payload, {
        withCredentials: true,
      });
      tempMessage.status = "received"; // Ubah status setelah berhasil dikirim
      tempMessage.id = res.data.id;

      // Kirim pesan melalui WebSocket ke penerima
      socket.emit("private message", {
        to: selectedChat.value.id, // receiver ID
        from: user.value.id, // sender ID
        message: res.data.content, // message content
      });
    } catch (err) {
      tempMessage.status = "error"; // Status pesan jika terjadi error
      console.error("Error sending message:", err);
    }
  }
}

function handleResize() {
  isMobile.value = window.innerWidth <= 768;
  if (!isMobile.value) sidebarOpen.value = false;
}

// Function to handle Socket.IO connection
function handleSocket() {
  if (!user.value) return;

  // Register the socket (only once when the user logs in)
  socket.emit("register", user.value.id);
  console.log("Socket registered for user:", user.value.id);

  // Ensure the event listener is only added once
  socket.off("new_message"); // Remove previous listeners
  socket.on("new_message", (msg) => {
    console.log("Received new message:", msg); // Log the incoming message

    // Check if the selected chat is the receiver of the message
    if (selectedChat.value && msg.senderId === selectedChat.value.id) {
      // Add the new message to the selected chat messages
      selectedChat.value.messages.push({
        id: Date.now(), // Unique ID for the new message
        text: msg.message, // Message content
        fromMe: false, // This message is from the other user
        status: "received", // Status of the message when received
      });

      // Scroll to the latest message
      nextTick(() => {
        const messageContainer = document.querySelector("section");
        messageContainer.scrollTop = messageContainer.scrollHeight;
      });
    }
  });
}

onMounted(async () => {
  await fetchChats(); // Fetch chats dari API
  handleResize(); // Update status mobile
  window.addEventListener("resize", handleResize); // Tambahkan listener resize
  handleSocket(); // Inisialisasi socket dan daftar event
});

onBeforeUnmount(() => {
  window.removeEventListener("resize", handleResize);
  socket.off("new_message"); // Bersihkan listener saat komponen di-unmount
});
</script>
