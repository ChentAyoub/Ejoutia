import { useLocalSearchParams } from "expo-router";
import {
    addDoc,
    collection,
    doc,
    getDoc,
    onSnapshot,
    orderBy,
    query,
    updateDoc,
    where,
} from "firebase/firestore";
import { useCallback, useEffect, useRef, useState } from "react";
import {
    ActivityIndicator,
    Animated,
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    Vibration,
    View,
} from "react-native";
import ConfettiCannon from "react-native-confetti-cannon";
import { Bubble, GiftedChat, IMessage } from "react-native-gifted-chat";
import { db } from "../firebaseConfig";
import AudioBubble from "./audio-bubble";
import ChatHeader from "./chat-header";
import EmojiPicker from "./emoji-picker";

const QUICK_REPLIES = [
  "C'est disponible ?",
  "Prix négociable ?",
  "Dernier prix ?",
  "On peut se voir où ?",
  "Toujours en vente ?",
];

interface OfferMessage extends IMessage {
  type?: "text" | "offer" | "audio";
  amount?: number;
  status?: "pending" | "accepted" | "refused";
  audioDuration?: number;
}

export default function ChatScreen({ role }: { role: "buyer" | "seller" }) {
  const { conversationId } = useLocalSearchParams<{ conversationId: string }>();
  const convId = conversationId ?? "conv_1";

  const me =
    role === "buyer"
      ? { _id: "buyer", name: "Acheteur" }
      : { _id: "seller", name: "Vendeur" };

  const [messages, setMessages] = useState<OfferMessage[]>([]);
  const [offerModal, setOfferModal] = useState(false);
  const [counterModal, setCounterModal] = useState<OfferMessage | null>(null);
  const [amountInput, setAmountInput] = useState("");
  const [otherUser, setOtherUser] = useState<any>(null);
  const [listing, setListing] = useState<any>(null);
  const [showEmoji, setShowEmoji] = useState(false);
  const [messageText, setMessageText] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const recordingPulse = useRef(new Animated.Value(1)).current;
  const confettiRef = useRef<any>(null);

  // Load header data
  useEffect(() => {
    const load = async () => {
      const cSnap = await getDoc(doc(db, "conversations", convId));
      if (!cSnap.exists()) return;
      const conv = cSnap.data();
      const otherId = role === "buyer" ? conv.sellerId : conv.buyerId;
      const uSnap = await getDoc(doc(db, "users", otherId));
      const lSnap = await getDoc(doc(db, "listings", conv.listingId));
      if (uSnap.exists()) setOtherUser(uSnap.data());
      if (lSnap.exists()) setListing(lSnap.data());
    };
    load();
  }, [role, convId]);

  // Real-time messages
  useEffect(() => {
    const q = query(
      collection(db, "messages"),
      where("conversationId", "==", convId),
      orderBy("createdAt", "desc"),
    );
    const unsub = onSnapshot(q, (snap) => {
      setMessages(
        snap.docs.map((d) => {
          const data = d.data();
          return {
            _id: d.id,
            text: data.text ?? "",
            createdAt: data.createdAt?.toDate?.() ?? new Date(),
            user: data.user,
            type: data.type ?? "text",
            amount: data.amount,
            status: data.status,
            audioDuration: data.audioDuration,
          } as OfferMessage;
        }),
      );
    });
    return unsub;
  }, [convId]);

  // Recording pulse animation
  useEffect(() => {
    if (isRecording) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(recordingPulse, {
            toValue: 1.3,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(recordingPulse, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
        ]),
      ).start();
    } else {
      recordingPulse.stopAnimation();
      recordingPulse.setValue(1);
    }
  }, [isRecording]);

  const onSend = useCallback(
    async (newMessages: OfferMessage[] = []) => {
      const msg = newMessages[0];
      await addDoc(collection(db, "messages"), {
        text: msg.text,
        createdAt: new Date(),
        user: me,
        type: "text",
        conversationId: convId,
      });
      await updateDoc(doc(db, "conversations", convId), {
        lastMessage: msg.text,
        lastTime: new Date(),
      });
      setShowEmoji(false);
    },
    [me, convId],
  );

  const sendQuickReply = async (text: string) => {
    await addDoc(collection(db, "messages"), {
      text,
      createdAt: new Date(),
      user: me,
      type: "text",
      conversationId: convId,
    });
    await updateDoc(doc(db, "conversations", convId), {
      lastMessage: text,
      lastTime: new Date(),
    });
  };

  const sendOffer = async (amount: number) => {
    await addDoc(collection(db, "messages"), {
      text: `Offre: ${amount} DH`,
      createdAt: new Date(),
      user: me,
      type: "offer",
      amount,
      status: "pending",
      conversationId: convId,
    });
    await updateDoc(doc(db, "conversations", convId), {
      lastMessage: `💰 Offre: ${amount} DH`,
      lastTime: new Date(),
    });
    setOfferModal(false);
    setCounterModal(null);
    setAmountInput("");
  };

  // Send a fake audio message (just UI, no real audio)
  const sendAudioMessage = async () => {
    const fakeDuration = 3 + Math.floor(Math.random() * 25);
    await addDoc(collection(db, "messages"), {
      text: "🎙️ Message vocal",
      createdAt: new Date(),
      user: me,
      type: "audio",
      audioDuration: fakeDuration,
      conversationId: convId,
    });
    await updateDoc(doc(db, "conversations", convId), {
      lastMessage: "🎙️ Message vocal",
      lastTime: new Date(),
    });
  };

  const handleRecordPress = () => {
    if (isRecording) {
      setIsRecording(false);
      sendAudioMessage();
    } else {
      setIsRecording(true);
      setTimeout(() => {
        setIsRecording(false);
        sendAudioMessage();
      }, 2000);
    }
  };

  const respondToOffer = async (
    offer: OfferMessage,
    status: "accepted" | "refused",
  ) => {
    await updateDoc(doc(db, "messages", String(offer._id)), { status });
    if (status === "accepted") {
      Vibration.vibrate(Platform.OS === "android" ? [0, 60, 40, 60] : 400);
      confettiRef.current?.start();
    }
  };

  const handleEmojiSelect = (emoji: string) => {
    setMessageText((prev) => prev + emoji);
  };

  // Custom bubble renderer
  const renderBubble = (props: any) => {
    const msg: OfferMessage = props.currentMessage;

    if (msg.type === "audio") {
      const isMine = msg.user._id === me._id;
      return <AudioBubble duration={msg.audioDuration ?? 12} isMine={isMine} />;
    }

    if (msg.type === "offer") {
      const mine = msg.user._id === me._id;
      const canRespond = !mine && msg.status === "pending";
      return (
        <View
          style={[
            styles.offerCard,
            msg.status === "accepted" && styles.offerAccepted,
            msg.status === "refused" && styles.offerRefused,
          ]}
        >
          <Text style={styles.offerLabel}>💰 OFFRE</Text>
          <Text style={styles.offerAmount}>{msg.amount} DH</Text>
          {msg.status === "pending" && (
            <Text style={styles.offerStatus}>En attente…</Text>
          )}
          {msg.status === "accepted" && (
            <Text style={styles.offerStatusOk}>Acceptée ✅</Text>
          )}
          {msg.status === "refused" && (
            <Text style={styles.offerStatusNo}>Refusée ❌</Text>
          )}
          {canRespond && (
            <View style={styles.offerButtons}>
              <TouchableOpacity
                style={[styles.offerBtn, styles.acceptBtn]}
                onPress={() => respondToOffer(msg, "accepted")}
              >
                <Text style={styles.offerBtnText}>Accepter</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.offerBtn, styles.refuseBtn]}
                onPress={() => respondToOffer(msg, "refused")}
              >
                <Text style={styles.offerBtnText}>Refuser</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.offerBtn, styles.counterBtn]}
                onPress={() => {
                  setCounterModal(msg);
                  setAmountInput("");
                }}
              >
                <Text style={styles.offerBtnText}>Contre-offre</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      );
    }

    return <Bubble {...props} />;
  };

  // Custom input toolbar with chips + emoji + audio
  const renderInputToolbar = () => {
    return (
      <View style={styles.inputWrap}>
        {isRecording && (
          <View style={styles.recordingOverlay}>
            <Animated.View
              style={[
                styles.recordingDot,
                { transform: [{ scale: recordingPulse }] },
              ]}
            />
            <Text style={styles.recordingText}>Enregistrement en cours...</Text>
            <TouchableOpacity
              onPress={() => setIsRecording(false)}
              style={styles.recordingCancel}
            >
              <Text style={styles.recordingCancelText}>✕</Text>
            </TouchableOpacity>
          </View>
        )}

        {!isRecording && (
          <>
            {messageText.trim().length === 0 && (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.chipsRow}
                contentContainerStyle={styles.chipsContent}
              >
                {QUICK_REPLIES.map((reply) => (
                  <TouchableOpacity
                    key={reply}
                    style={styles.chip}
                    onPress={() => sendQuickReply(reply)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.chipText}>{reply}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}

            <View style={styles.inputRow}>
              <TouchableOpacity
                style={styles.inputAction}
                onPress={() => setShowEmoji(!showEmoji)}
                activeOpacity={0.6}
              >
                <Text style={styles.inputActionIcon}>
                  {showEmoji ? "⌨️" : "😊"}
                </Text>
              </TouchableOpacity>

              <TextInput
                style={styles.textInput}
                value={messageText}
                onChangeText={setMessageText}
                placeholder="Écrire un message..."
                placeholderTextColor="#999"
                multiline
                onFocus={() => setShowEmoji(false)}
              />

              {messageText.trim().length > 0 ? (
                <TouchableOpacity
                  style={styles.sendBtn}
                  onPress={() => {
                    if (messageText.trim()) {
                      onSend([
                        {
                          _id: Date.now().toString(),
                          text: messageText.trim(),
                          createdAt: new Date(),
                          user: me,
                        },
                      ]);
                      setMessageText("");
                    }
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={styles.sendIcon}>➤</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={styles.micBtn}
                  onPress={handleRecordPress}
                  activeOpacity={0.7}
                >
                  <Text style={styles.micIcon}>🎙️</Text>
                </TouchableOpacity>
              )}
            </View>
          </>
        )}
      </View>
    );
  };

  const presets = counterModal?.amount
    ? [
        counterModal.amount + 10,
        counterModal.amount + 20,
        counterModal.amount + 50,
      ]
    : [50, 100, 150];

  if (!otherUser || !listing) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" />
        <Text>Chargement…</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ChatHeader role={role} otherUser={otherUser} listing={listing} />

      <TouchableOpacity
        style={styles.offerCta}
        onPress={() => {
          setOfferModal(true);
          setAmountInput("");
        }}
      >
        <Text style={styles.offerCtaText}>💸 Faire une offre</Text>
      </TouchableOpacity>

      <GiftedChat
        messages={messages}
        onSend={(msgs) => onSend(msgs as OfferMessage[])}
        user={me}
        renderBubble={renderBubble}
        renderInputToolbar={renderInputToolbar}
        text={messageText}
        onInputTextChanged={setMessageText}
        minInputToolbarHeight={0}
        renderComposer={() => null}
        renderSend={() => null}
        renderActions={() => null}
      />

      <EmojiPicker
        visible={showEmoji}
        onSelect={handleEmojiSelect}
        onClose={() => setShowEmoji(false)}
      />

      <ConfettiCannon
        count={120}
        origin={{ x: 200, y: 0 }}
        autoStart={false}
        fadeOut
        ref={confettiRef}
      />

      {/* Offer modal */}
      <Modal visible={offerModal} transparent animationType="slide">
        <View style={styles.modalBg}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Faire une offre</Text>
            <Text style={styles.modalSub}>Prix suggérés</Text>
            <View style={styles.presetRow}>
              {[
                Math.round((listing.price ?? 100) * 0.8),
                Math.round((listing.price ?? 100) * 0.9),
                listing.price ?? 100,
              ].map((p) => (
                <TouchableOpacity
                  key={p}
                  style={[
                    styles.preset,
                    amountInput === String(p) && styles.presetActive,
                  ]}
                  onPress={() => setAmountInput(String(p))}
                >
                  <Text
                    style={[
                      styles.presetText,
                      amountInput === String(p) && styles.presetTextActive,
                    ]}
                  >
                    {p} DH
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text style={styles.modalSub}>Ou entrez votre prix</Text>
            <TextInput
              style={styles.modalInput}
              keyboardType="numeric"
              placeholder="Votre prix en DH"
              value={amountInput}
              onChangeText={setAmountInput}
            />
            <View style={styles.modalRow}>
              <TouchableOpacity
                style={styles.modalCancel}
                onPress={() => setOfferModal(false)}
              >
                <Text>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalSend}
                onPress={() => {
                  const n = parseInt(amountInput);
                  if (n > 0) sendOffer(n);
                }}
              >
                <Text style={styles.modalSendText}>Envoyer</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Counter-offer modal */}
      <Modal visible={!!counterModal} transparent animationType="slide">
        <View style={styles.modalBg}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Contre-offre</Text>
            <Text style={styles.modalSub}>
              Offre reçue: {counterModal?.amount} DH
            </Text>
            <View style={styles.presetRow}>
              {presets.map((p) => (
                <TouchableOpacity
                  key={p}
                  style={styles.preset}
                  onPress={() => sendOffer(p)}
                >
                  <Text style={styles.presetText}>{p} DH</Text>
                </TouchableOpacity>
              ))}
            </View>
            <TextInput
              style={styles.modalInput}
              keyboardType="numeric"
              placeholder="Ou montant personnalisé"
              value={amountInput}
              onChangeText={setAmountInput}
            />
            <View style={styles.modalRow}>
              <TouchableOpacity
                style={styles.modalCancel}
                onPress={() => setCounterModal(null)}
              >
                <Text>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalSend}
                onPress={() => {
                  const n = parseInt(amountInput);
                  if (n > 0) sendOffer(n);
                }}
              >
                <Text style={styles.modalSendText}>Envoyer</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  loading: { flex: 1, justifyContent: "center", alignItems: "center", gap: 10 },
  offerCta: {
    backgroundColor: "#ff6f00",
    paddingVertical: 12,
    alignItems: "center",
  },
  offerCtaText: { color: "#fff", fontWeight: "700", fontSize: 15 },

  inputWrap: {
    borderTopWidth: 1,
    borderTopColor: "#eee",
    backgroundColor: "#fff",
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: 8,
    paddingVertical: 6,
    gap: 6,
  },
  inputAction: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f5f5f5",
  },
  inputActionIcon: { fontSize: 20 },
  textInput: {
    flex: 1,
    minHeight: 38,
    maxHeight: 100,
    backgroundColor: "#f5f5f5",
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    fontSize: 15,
    color: "#222",
  },
  sendBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#ff6f00",
    alignItems: "center",
    justifyContent: "center",
  },
  sendIcon: { color: "#fff", fontSize: 18, marginLeft: 2 },
  micBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#f5f5f5",
    alignItems: "center",
    justifyContent: "center",
  },
  micIcon: { fontSize: 20 },

  chipsRow: { maxHeight: 44, borderTopWidth: 1, borderTopColor: "#f0f0f0" },
  chipsContent: {
    paddingHorizontal: 8,
    paddingVertical: 7,
    gap: 8,
    alignItems: "center",
  },
  chip: {
    backgroundColor: "#fff3e0",
    borderWidth: 1,
    borderColor: "#ffcc80",
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 7,
    marginRight: 8,
  },
  chipText: { color: "#ff6f00", fontWeight: "600", fontSize: 13 },

  recordingOverlay: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: "#fff5f5",
    gap: 10,
  },
  recordingDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#e53935",
  },
  recordingText: { flex: 1, color: "#e53935", fontWeight: "600", fontSize: 14 },
  recordingCancel: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#ffcdd2",
    alignItems: "center",
    justifyContent: "center",
  },
  recordingCancelText: { color: "#e53935", fontWeight: "700", fontSize: 14 },

  offerCard: {
    backgroundColor: "#fff3e0",
    borderWidth: 2,
    borderColor: "#ff6f00",
    borderRadius: 14,
    padding: 14,
    margin: 6,
    minWidth: 180,
    alignItems: "center",
  },
  offerAccepted: { backgroundColor: "#e8f5e9", borderColor: "#2e7d32" },
  offerRefused: { backgroundColor: "#ffebee", borderColor: "#c62828" },
  offerLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: "#ff6f00",
    letterSpacing: 1,
  },
  offerAmount: {
    fontSize: 26,
    fontWeight: "800",
    color: "#333",
    marginVertical: 4,
  },
  offerStatus: { color: "#999", fontStyle: "italic" },
  offerStatusOk: { color: "#2e7d32", fontWeight: "700" },
  offerStatusNo: { color: "#c62828", fontWeight: "700" },
  offerButtons: {
    flexDirection: "row",
    marginTop: 10,
    gap: 6,
    flexWrap: "wrap",
    justifyContent: "center",
  },
  offerBtn: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 8 },
  acceptBtn: { backgroundColor: "#2e7d32" },
  refuseBtn: { backgroundColor: "#c62828" },
  counterBtn: { backgroundColor: "#1565c0" },
  offerBtnText: { color: "#fff", fontWeight: "600", fontSize: 13 },

  modalBg: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end",
  },
  modalCard: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
  },
  modalTitle: { fontSize: 18, fontWeight: "700", marginBottom: 12 },
  modalSub: { color: "#666", marginBottom: 10 },
  modalInput: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    marginBottom: 14,
  },
  modalRow: { flexDirection: "row", justifyContent: "flex-end", gap: 12 },
  modalCancel: { paddingVertical: 10, paddingHorizontal: 16 },
  modalSend: {
    backgroundColor: "#ff6f00",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  modalSendText: { color: "#fff", fontWeight: "700" },
  presetRow: { flexDirection: "row", gap: 8, marginBottom: 14 },
  preset: {
    flex: 1,
    backgroundColor: "#e3f2fd",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  presetText: { color: "#1565c0", fontWeight: "700" },
  presetActive: { backgroundColor: "#1565c0" },
  presetTextActive: { color: "#fff" },
});
