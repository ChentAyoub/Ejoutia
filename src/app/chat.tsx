// src/app/chat.tsx
import {
    addDoc,
    collection,
    doc,
    onSnapshot,
    orderBy,
    query,
    updateDoc,
} from "firebase/firestore";
import { useCallback, useEffect, useRef, useState } from "react";
import {
    Modal,
    Platform,
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

const BUYER = { _id: "buyer", name: "Acheteur" };
const SELLER = { _id: "seller", name: "Vendeur" };

// Extend the message type to carry offer data
interface OfferMessage extends IMessage {
  type?: "text" | "offer";
  amount?: number;
  status?: "pending" | "accepted" | "refused";
}

export default function Chat() {
  const [messages, setMessages] = useState<OfferMessage[]>([]);
  const [isBuyer, setIsBuyer] = useState(true);
  const [offerModal, setOfferModal] = useState(false);
  const [counterModal, setCounterModal] = useState<OfferMessage | null>(null);
  const [amountInput, setAmountInput] = useState("");
  const confettiRef = useRef<any>(null);

  const currentUser = isBuyer ? BUYER : SELLER;

  // Real-time listener
  useEffect(() => {
    const q = query(collection(db, "messages"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      const loaded = snap.docs.map((d) => {
        const data = d.data();
        return {
          _id: d.id,
          text: data.text ?? "",
          createdAt: data.createdAt?.toDate?.() ?? new Date(),
          user: data.user,
          type: data.type ?? "text",
          amount: data.amount,
          status: data.status,
        } as OfferMessage;
      });
      setMessages(loaded);
    });
    return unsub;
  }, []);

  // Send a normal text message
  const onSend = useCallback(
    async (newMessages: OfferMessage[] = []) => {
      const msg = newMessages[0];
      await addDoc(collection(db, "messages"), {
        text: msg.text,
        createdAt: new Date(),
        user: currentUser,
        type: "text",
      });
    },
    [currentUser],
  );

  // Send an offer (or counter-offer)
  const sendOffer = async (amount: number) => {
    await addDoc(collection(db, "messages"), {
      text: `Offre: ${amount} DH`,
      createdAt: new Date(),
      user: currentUser,
      type: "offer",
      amount,
      status: "pending",
    });
    setOfferModal(false);
    setCounterModal(null);
    setAmountInput("");
  };

  // Accept or refuse an offer
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

  // Custom render for offer cards
  const renderBubble = (props: any) => {
    const msg: OfferMessage = props.currentMessage;
    if (msg.type !== "offer") {
      return <Bubble {...props} />;
    }

    const mine = msg.user._id === currentUser._id;
    const canRespond = !mine && msg.status === "pending";

    const cardStyle = [
      styles.offerCard,
      msg.status === "accepted" && styles.offerAccepted,
      msg.status === "refused" && styles.offerRefused,
    ];

    return (
      <View style={cardStyle}>
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
  };

  // Quick preset amounts for counter-offers (inDrive style)
  const presets = counterModal?.amount
    ? [
        counterModal.amount + 10,
        counterModal.amount + 20,
        counterModal.amount + 50,
      ]
    : [50, 100, 150];

  return (
    <View style={styles.container}>
      {/* Toggle */}
      <View style={styles.toggleBar}>
        <Text style={styles.toggleLabel}>Sending as:</Text>
        <TouchableOpacity
          style={[styles.toggleBtn, isBuyer && styles.toggleActive]}
          onPress={() => setIsBuyer(true)}
        >
          <Text style={[styles.toggleText, isBuyer && styles.toggleTextActive]}>
            Acheteur
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.toggleBtn, !isBuyer && styles.toggleActive]}
          onPress={() => setIsBuyer(false)}
        >
          <Text
            style={[styles.toggleText, !isBuyer && styles.toggleTextActive]}
          >
            Vendeur
          </Text>
        </TouchableOpacity>
      </View>

      {/* Faire une offre button */}
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
        user={currentUser}
        renderBubble={renderBubble}
        textInputProps={{ placeholder: "Écrire un message..." }}
      />

      {/* Confetti overlay */}
      <ConfettiCannon
        count={120}
        origin={{ x: 200, y: 0 }}
        autoStart={false}
        fadeOut
        ref={confettiRef}
      />

      {/* Make-an-offer modal */}
      <Modal visible={offerModal} transparent animationType="slide">
        <View style={styles.modalBg}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Faire une offre</Text>
            <TextInput
              style={styles.modalInput}
              keyboardType="numeric"
              placeholder="Montant en DH"
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

      {/* Counter-offer modal (inDrive style presets + custom) */}
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
  toggleBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "#f2f2f2",
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  toggleLabel: { marginRight: 10, color: "#555", fontSize: 13 },
  toggleBtn: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    backgroundColor: "#e0e0e0",
  },
  toggleActive: { backgroundColor: "#2e7d32" },
  toggleText: { color: "#555", fontWeight: "500" },
  toggleTextActive: { color: "#fff" },

  offerCta: {
    backgroundColor: "#ff6f00",
    paddingVertical: 12,
    alignItems: "center",
  },
  offerCtaText: { color: "#fff", fontWeight: "700", fontSize: 15 },

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
});
