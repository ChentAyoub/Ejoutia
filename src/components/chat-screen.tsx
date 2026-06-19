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
  FlatList,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  Vibration,
  View,
  ImageBackground,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import ConfettiCannon from "react-native-confetti-cannon";
import { db } from "../firebaseConfig";
import { Brand, Radius, Shadow } from "../constants/theme";
import AudioBubble from "./audio-bubble";
import ChatHeader from "./chat-header";
import EmojiPicker from "./emoji-picker";

// ─── Types ───
interface ChatMessage {
  _id: string;
  text: string;
  createdAt: Date;
  user: { _id: string; name: string };
  type?: "text" | "offer" | "audio";
  amount?: number;
  status?: "pending" | "accepted" | "refused";
  audioDuration?: number;
}

const BUYER_SUGGESTIONS = [
  "C'est disponible ?",
  "Dernier prix ?",
  "Livraison possible ?",
  "État du produit ?",
];
const SELLER_SUGGESTIONS = [
  "Oui, disponible !",
  "Le prix est ferme",
  "Je peux livrer",
  "Envoyez une offre",
];

export default function ChatScreen({ role }: { role: "buyer" | "seller" }) {
  const { conversationId } = useLocalSearchParams<{ conversationId: string }>();
  const convId = conversationId ?? "conv_1";

  const me =
    role === "buyer"
      ? { _id: "buyer", name: "Acheteur" }
      : { _id: "seller", name: "Vendeur" };

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [offerModal, setOfferModal] = useState(false);
  const [counterModal, setCounterModal] = useState<ChatMessage | null>(null);
  const [amountInput, setAmountInput] = useState("");
  const [otherUser, setOtherUser] = useState<any>(null);
  const [listing, setListing] = useState<any>(null);
  const [showEmoji, setShowEmoji] = useState(false);
  const [messageText, setMessageText] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const recordingPulse = useRef(new Animated.Value(1)).current;
  const confettiRef = useRef<any>(null);
  const flatListRef = useRef<FlatList>(null);

  // ─── Load header data ───
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

  // ─── Real-time messages ───
  useEffect(() => {
    const q = query(
      collection(db, "messages"),
      where("conversationId", "==", convId),
      orderBy("createdAt", "asc")
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
          } as ChatMessage;
        })
      );
    });
    return unsub;
  }, [convId]);

  // ─── Recording pulse ───
  useEffect(() => {
    if (isRecording) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(recordingPulse, { toValue: 1.3, duration: 600, useNativeDriver: true }),
          Animated.timing(recordingPulse, { toValue: 1, duration: 600, useNativeDriver: true }),
        ])
      ).start();
    } else {
      recordingPulse.stopAnimation();
      recordingPulse.setValue(1);
    }
  }, [isRecording]);

  const sendMessage = useCallback(
    async (text: string) => {
      if (!text.trim()) return;
      await addDoc(collection(db, "messages"), {
        text: text.trim(),
        createdAt: new Date(),
        user: me,
        type: "text",
        conversationId: convId,
      });
      await updateDoc(doc(db, "conversations", convId), {
        lastMessage: text.trim(),
        lastTime: new Date(),
      });
      setShowEmoji(false);
      setMessageText("");
    },
    [me, convId]
  );

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

  const sendAudioMessage = async () => {
    const fakeDuration = 3 + Math.floor(Math.random() * 25);
    await addDoc(collection(db, "messages"), {
      text: "Message vocal",
      createdAt: new Date(),
      user: me,
      type: "audio",
      audioDuration: fakeDuration,
      conversationId: convId,
    });
    await updateDoc(doc(db, "conversations", convId), {
      lastMessage: "🎙 Message vocal",
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

  const respondToOffer = async (offer: ChatMessage, status: "accepted" | "refused") => {
    await updateDoc(doc(db, "messages", String(offer._id)), { status });
    if (status === "accepted") {
      Vibration.vibrate(Platform.OS === "android" ? [0, 60, 40, 60] : 400);
      confettiRef.current?.start();
    }
  };

  const formatTime = (date: Date) => {
    const h = date.getHours().toString().padStart(2, "0");
    const m = date.getMinutes().toString().padStart(2, "0");
    return `${h}:${m}`;
  };

  const renderMessage = ({ item, index }: { item: ChatMessage; index: number }) => {
    const isMine = item.user._id === me._id;
    const showTime =
      index === 0 ||
      item.createdAt.getTime() - messages[index - 1].createdAt.getTime() > 300000;

    return (
      <View style={s.messageWrapper}>
        {showTime && (
          <Text style={s.timeStamp}>{formatTime(item.createdAt)}</Text>
        )}

        {/* Audio bubble */}
        {item.type === "audio" && (
          <View style={[s.bubbleRow, isMine ? s.bubbleRowRight : s.bubbleRowLeft]}>
            <AudioBubble duration={item.audioDuration ?? 12} isMine={isMine} />
          </View>
        )}

        {/* Offer card */}
        {item.type === "offer" && (
          <View style={[s.bubbleRow, isMine ? s.bubbleRowRight : s.bubbleRowLeft]}>
            <View
              style={[
                s.offerCard,
                isMine ? s.sharpRight : s.sharpLeft,
                item.status === "accepted" && s.offerAccepted,
                item.status === "refused" && s.offerRefused,
              ]}
            >
              <Text style={s.offerLabel}>OFFRE</Text>
              <Text style={s.offerAmount}>{item.amount} DH</Text>
              {item.status === "pending" && (
                <Text style={s.offerStatus}>En attente…</Text>
              )}
              {item.status === "accepted" && (
                <Text style={s.offerStatusOk}>Acceptée ✓</Text>
              )}
              {item.status === "refused" && (
                <Text style={s.offerStatusNo}>Refusée ✕</Text>
              )}
              {!isMine && item.status === "pending" && (
                <View style={s.offerButtons}>
                  <TouchableOpacity
                    style={[s.offerBtn, { backgroundColor: Brand.primaryLight }]}
                    onPress={() => respondToOffer(item, "accepted")}
                  >
                    <Text style={s.offerBtnText}>Accepter</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[s.offerBtn, { backgroundColor: Brand.red }]}
                    onPress={() => respondToOffer(item, "refused")}
                  >
                    <Text style={s.offerBtnText}>Refuser</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[s.offerBtn, { backgroundColor: Brand.charcoal }]}
                    onPress={() => {
                      setCounterModal(item);
                      setAmountInput("");
                    }}
                  >
                    <Text style={s.offerBtnText}>Contre-offre</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>
        )}

        {/* Text bubble */}
        {(item.type === "text" || !item.type) && (
          <View style={[s.bubbleRow, isMine ? s.bubbleRowRight : s.bubbleRowLeft]}>
            {isMine ? (
              <LinearGradient
                colors={[Brand.primary, Brand.primaryLight]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[s.bubble, s.sharpRight]}
              >
                <Text style={[s.bubbleText, s.bubbleTextMine]}>{item.text}</Text>
                <Text style={[s.bubbleTimeInside, s.bubbleTimeMine]}>{formatTime(item.createdAt)}</Text>
              </LinearGradient>
            ) : (
              <View style={[s.bubble, s.bubbleTheirs, s.sharpLeft]}>
                <Text style={[s.bubbleText, s.bubbleTextTheirs]}>{item.text}</Text>
                <Text style={[s.bubbleTimeInside, s.bubbleTimeTheirs]}>{formatTime(item.createdAt)}</Text>
              </View>
            )}
          </View>
        )}
      </View>
    );
  };

  const renderSuggestions = () => {
    if (messages.length > 0) return null;
    const suggestions = role === "buyer" ? BUYER_SUGGESTIONS : SELLER_SUGGESTIONS;
    return (
      <View style={s.suggestionsWrap}>
        <Text style={s.suggestionsTitle}>
          {role === "buyer" ? "Commencez la discussion" : "Réponse rapide"}
        </Text>
        <View style={s.suggestionsGrid}>
          {suggestions.map((text) => (
            <TouchableOpacity
              key={text}
              onPress={() => sendMessage(text)}
              activeOpacity={0.7}
            >
              <View style={s.suggestionPill}>
                <Text style={s.suggestionText}>{text}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  };

  const presets = counterModal?.amount
    ? [counterModal.amount + 10, counterModal.amount + 20, counterModal.amount + 50]
    : [50, 100, 150];

  if (!otherUser || !listing) {
    return (
      <View style={s.loading}>
        <ActivityIndicator size="large" color={Brand.primary} />
      </View>
    );
  }

  return (
    <View style={s.container}>
      <ChatHeader role={role} otherUser={otherUser} listing={listing} />

      <ImageBackground
        style={s.chatArea}
        source={require('../../assets/images/chat_pattern_bg.png')}
        resizeMode="cover"
        blurRadius={6}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item._id}
          renderItem={renderMessage}
          contentContainerStyle={s.chatContent}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() =>
            flatListRef.current?.scrollToEnd({ animated: true })
          }
          ListEmptyComponent={renderSuggestions}
        />
      </ImageBackground>

      {/* Floating Pill Input */}
      <View style={s.floatingInputContainer}>
        {isRecording ? (
          <View style={s.recordingPill}>
            <Animated.View
              style={[s.recordingDot, { transform: [{ scale: recordingPulse }] }]}
            />
            <Text style={s.recordingText}>Enregistrement vocal...</Text>
            <TouchableOpacity onPress={() => setIsRecording(false)} style={s.recordingCancel}>
              <Text style={s.recordingCancelText}>✕</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={s.floatingPill}>
            <TouchableOpacity onPress={() => setShowEmoji(!showEmoji)} style={s.iconBtn}>
              <Text style={s.iconEmoji}>{showEmoji ? "⌨️" : "😊"}</Text>
            </TouchableOpacity>
            
            <TouchableOpacity onPress={() => { setOfferModal(true); setAmountInput(""); }} style={s.iconBtn}>
              <Text style={s.iconEmoji}>💸</Text>
            </TouchableOpacity>

            <TextInput
              style={s.textInput}
              value={messageText}
              onChangeText={setMessageText}
              placeholder="Message..."
              placeholderTextColor={Brand.grayDark}
              multiline
              onFocus={() => setShowEmoji(false)}
            />

            {messageText.trim().length > 0 ? (
              <TouchableOpacity onPress={() => sendMessage(messageText)} activeOpacity={0.8}>
                <LinearGradient
                  colors={[Brand.primary, Brand.primaryLight]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={s.sendCircleBtn}
                >
                  <Text style={s.sendIcon}>↑</Text>
                </LinearGradient>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity onPress={handleRecordPress} activeOpacity={0.8} style={s.micCircleBtn}>
                <Text style={s.micIcon}>🎙</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>

      <EmojiPicker
        visible={showEmoji}
        onSelect={(emoji) => setMessageText((prev) => prev + emoji)}
        onClose={() => setShowEmoji(false)}
      />

      <ConfettiCannon
        count={120}
        origin={{ x: 200, y: 0 }}
        autoStart={false}
        fadeOut
        ref={confettiRef}
      />

      {/* Radical Modal Redesign */}
      <Modal visible={offerModal} transparent animationType="slide">
        <View style={s.modalBg}>
          <View style={s.modalGlass}>
            <View style={s.modalHandle} />
            <Text style={s.modalHugeTitle}>Nouvelle Offre</Text>
            
            <View style={s.hugeInputWrapper}>
              <TextInput
                style={s.hugeInput}
                keyboardType="numeric"
                placeholder="0"
                placeholderTextColor={Brand.grayMed}
                value={amountInput}
                onChangeText={setAmountInput}
                autoFocus
              />
              <Text style={s.hugeCurrency}>DH</Text>
            </View>

            <View style={s.presetRow}>
              {[
                Math.round((listing?.price ?? 100) * 0.8),
                Math.round((listing?.price ?? 100) * 0.9),
                listing?.price ?? 100,
              ].map((p) => (
                <TouchableOpacity
                  key={p}
                  style={[s.presetPill, amountInput === String(p) && s.presetPillActive]}
                  onPress={() => setAmountInput(String(p))}
                  activeOpacity={0.7}
                >
                  <Text style={[s.presetPillText, amountInput === String(p) && s.presetPillTextActive]}>
                    {p} DH
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={s.modalActionsRow}>
              <TouchableOpacity style={s.modalCancelFlat} onPress={() => setOfferModal(false)}>
                <Text style={s.modalCancelFlatText}>Fermer</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[s.modalSendHuge, !amountInput && { opacity: 0.4 }]}
                onPress={() => {
                  const n = parseInt(amountInput);
                  if (n > 0) sendOffer(n);
                }}
                disabled={!amountInput}
              >
                <LinearGradient
                  colors={[Brand.primary, Brand.primaryLight]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={s.modalSendHugeGradient}
                >
                  <Text style={s.modalSendHugeText}>Envoyer l'offre</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Counter Offer Modal */}
      <Modal visible={!!counterModal} transparent animationType="slide">
        <View style={s.modalBg}>
          <View style={s.modalGlass}>
            <View style={s.modalHandle} />
            <Text style={s.modalHugeTitle}>Contre-offre</Text>
            <Text style={s.modalSubTitle}>Ils ont proposé {counterModal?.amount} DH</Text>
            
            <View style={s.hugeInputWrapper}>
              <TextInput
                style={s.hugeInput}
                keyboardType="numeric"
                placeholder="0"
                placeholderTextColor={Brand.grayMed}
                value={amountInput}
                onChangeText={setAmountInput}
              />
              <Text style={s.hugeCurrency}>DH</Text>
            </View>

            <View style={s.presetRow}>
              {presets.map((p) => (
                <TouchableOpacity
                  key={p}
                  style={[s.presetPill, amountInput === String(p) && s.presetPillActive]}
                  onPress={() => setAmountInput(String(p))}
                  activeOpacity={0.7}
                >
                  <Text style={[s.presetPillText, amountInput === String(p) && s.presetPillTextActive]}>
                    {p} DH
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={s.modalActionsRow}>
              <TouchableOpacity style={s.modalCancelFlat} onPress={() => setCounterModal(null)}>
                <Text style={s.modalCancelFlatText}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[s.modalSendHuge, !amountInput && { opacity: 0.4 }]}
                onPress={() => {
                  const n = parseInt(amountInput);
                  if (n > 0) sendOffer(n);
                }}
                disabled={!amountInput}
              >
                <LinearGradient
                  colors={[Brand.primary, Brand.primaryLight]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={s.modalSendHugeGradient}
                >
                  <Text style={s.modalSendHugeText}>Envoyer</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

// ─── Styles ───
const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Brand.offWhite },
  loading: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: Brand.offWhite },

  chatArea: { flex: 1 },
  chatContent: { paddingHorizontal: 16, paddingVertical: 12, flexGrow: 1, justifyContent: "flex-end", paddingBottom: 100 },

  messageWrapper: { marginBottom: 12 },
  
  timeStamp: {
    textAlign: "center",
    color: Brand.grayDark,
    fontSize: 12,
    fontWeight: "600",
    marginVertical: 16,
    textTransform: "uppercase",
    letterSpacing: 1,
  },

  bubbleRow: { marginBottom: 4 },
  bubbleRowRight: { alignItems: "flex-end" },
  bubbleRowLeft: { alignItems: "flex-start" },

  bubble: {
    maxWidth: "80%",
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: Radius.xxl,
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 12,
    ...Shadow.sm,
  },
  sharpRight: { borderBottomRightRadius: 4 },
  sharpLeft: { borderBottomLeftRadius: 4 },
  
  bubbleTheirs: { backgroundColor: Brand.white },
  
  bubbleText: { fontSize: 16, lineHeight: 22, flexShrink: 1 },
  bubbleTextMine: { color: "#fff", fontWeight: "500" },
  bubbleTextTheirs: { color: Brand.charcoal, fontWeight: "500" },

  bubbleTimeInside: { fontSize: 10, fontWeight: "600", marginBottom: 2 },
  bubbleTimeMine: { color: "rgba(255,255,255,0.7)" },
  bubbleTimeTheirs: { color: Brand.grayDark },

  suggestionsWrap: { flex: 1, justifyContent: "center", alignItems: "center", paddingHorizontal: 24, paddingBottom: 20 },
  suggestionsTitle: { fontSize: 16, fontWeight: "700", color: Brand.grayDark, marginBottom: 24, textAlign: "center" },
  suggestionsGrid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "center", gap: 12 },
  suggestionPill: {
    backgroundColor: Brand.white,
    borderWidth: 1,
    borderColor: Brand.grayLight,
    borderRadius: Radius.full,
    paddingHorizontal: 20,
    paddingVertical: 14,
    ...Shadow.sm,
  },
  suggestionText: { color: Brand.primary, fontWeight: "700", fontSize: 14 },

  floatingInputContainer: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 30 : 20,
    left: 16,
    right: 16,
    zIndex: 10,
  },
  floatingPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Brand.white,
    borderRadius: 30,
    paddingHorizontal: 8,
    paddingVertical: 8,
    ...Shadow.lg,
  },
  iconBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  iconEmoji: { fontSize: 24 },
  textInput: {
    flex: 1,
    minHeight: 44,
    maxHeight: 120,
    paddingHorizontal: 12,
    fontSize: 16,
    color: Brand.charcoal,
    fontWeight: "500",
  },
  sendCircleBtn: { width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center" },
  sendIcon: { color: "#fff", fontSize: 20, fontWeight: "800" },
  micCircleBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: Brand.offWhite, alignItems: "center", justifyContent: "center" },
  micIcon: { fontSize: 20 },

  recordingPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Brand.white,
    borderRadius: 30,
    paddingHorizontal: 16,
    paddingVertical: 12,
    ...Shadow.lg,
    gap: 12,
  },
  recordingDot: { width: 14, height: 14, borderRadius: 7, backgroundColor: Brand.red },
  recordingText: { flex: 1, color: Brand.red, fontWeight: "700", fontSize: 16 },
  recordingCancel: { width: 36, height: 36, borderRadius: 18, backgroundColor: Brand.redLight, alignItems: "center", justifyContent: "center" },
  recordingCancelText: { color: Brand.red, fontWeight: "800", fontSize: 16 },

  offerCard: {
    backgroundColor: Brand.white,
    borderRadius: Radius.xxl,
    padding: 24,
    marginVertical: 6,
    minWidth: 240,
    alignItems: "center",
    ...Shadow.md,
  },
  offerAccepted: { backgroundColor: Brand.greenLight },
  offerRefused: { backgroundColor: Brand.redLight },
  offerLabel: { fontSize: 12, fontWeight: "800", color: Brand.primary, letterSpacing: 2 },
  offerAmount: { fontSize: 36, fontWeight: "900", color: Brand.charcoal, marginVertical: 12 },
  offerStatus: { color: Brand.grayDark, fontSize: 14, fontWeight: "600" },
  offerStatusOk: { color: Brand.green, fontWeight: "800", fontSize: 15 },
  offerStatusNo: { color: Brand.red, fontWeight: "800", fontSize: 15 },
  offerButtons: { flexDirection: "row", marginTop: 20, gap: 12, flexWrap: "wrap", justifyContent: "center" },
  offerBtn: { paddingHorizontal: 20, paddingVertical: 12, borderRadius: Radius.full },
  offerBtnText: { color: "#fff", fontWeight: "700", fontSize: 14 },

  modalBg: { flex: 1, backgroundColor: "rgba(0,0,0,0.6)", justifyContent: "flex-end" },
  modalGlass: {
    backgroundColor: Brand.offWhite,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: Platform.OS === "ios" ? 48 : 32,
  },
  modalHandle: { width: 60, height: 6, borderRadius: 3, backgroundColor: Brand.grayMed, alignSelf: "center", marginBottom: 32 },
  modalHugeTitle: { fontSize: 32, fontWeight: "900", color: Brand.charcoal, marginBottom: 8, textAlign: "center" },
  modalSubTitle: { fontSize: 16, fontWeight: "600", color: Brand.grayDark, marginBottom: 32, textAlign: "center" },
  
  hugeInputWrapper: { flexDirection: "row", alignItems: "baseline", justifyContent: "center", marginBottom: 40 },
  hugeInput: { fontSize: 64, fontWeight: "900", color: Brand.primary, textAlign: "center" },
  hugeCurrency: { fontSize: 24, fontWeight: "800", color: Brand.grayDark, marginLeft: 8 },

  presetRow: { flexDirection: "row", gap: 12, marginBottom: 40 },
  presetPill: {
    flex: 1,
    backgroundColor: Brand.white,
    paddingVertical: 16,
    borderRadius: Radius.full,
    alignItems: "center",
    ...Shadow.sm,
  },
  presetPillText: { color: Brand.charcoal, fontWeight: "800", fontSize: 16 },
  presetPillActive: { backgroundColor: Brand.primary },
  presetPillTextActive: { color: Brand.white },

  modalActionsRow: { flexDirection: "row", gap: 16, alignItems: "center" },
  modalCancelFlat: { flex: 1, paddingVertical: 20, alignItems: "center", justifyContent: "center" },
  modalCancelFlatText: { fontWeight: "700", color: Brand.grayDark, fontSize: 18 },
  modalSendHuge: { flex: 2, borderRadius: Radius.full, overflow: "hidden", ...Shadow.lg },
  modalSendHugeGradient: { paddingVertical: 20, alignItems: "center", justifyContent: "center" },
  modalSendHugeText: { color: "#fff", fontWeight: "800", fontSize: 18 },
});
