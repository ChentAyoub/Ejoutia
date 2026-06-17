import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';

interface EmojiPickerProps {
  visible: boolean;
  onSelect: (emoji: string) => void;
  onClose: () => void;
}

interface Category {
  icon: string;
  label: string;
  emojis: string[];
}

const CATEGORIES: Category[] = [
  {
    icon: '😀',
    label: 'Smileys',
    emojis: [
      '😀','😃','😄','😁','😆','😅','🤣','😂',
      '🙂','😉','😊','😇','🥰','😍','🤩','😘',
      '😗','😋','😛','😜','🤪','😝','🤑','🤗',
      '🤭','🤫','🤔','🤐','🤨','😐','😑','😶',
      '😏','😒','🙄','😬','🤥','😌','😔','😪',
      '🤤','😴',
    ],
  },
  {
    icon: '👋',
    label: 'Gestures',
    emojis: [
      '👋','🤚','🖐','✋','🖖','👌','🤌','🤏',
      '✌','🤞','🤟','🤘','🤙','👈','👉','👆',
      '🖕','👇','☝','👍','👎','✊','👊','🤛',
      '🤜','👏','🙌','👐','🤲','🤝','🙏',
    ],
  },
  {
    icon: '❤️',
    label: 'Hearts',
    emojis: [
      '❤️','🧡','💛','💚','💙','💜','🖤','🤍',
      '🤎','💔','❣️','💕','💞','💓','💗','💖',
      '💘','💝',
    ],
  },
  {
    icon: '🎉',
    label: 'Objects',
    emojis: [
      '🎉','🎊','🎁','🎈','🔥','⭐','💫','✨',
      '🌟','💯','💰','💵','💸','🏠','🏡','🚗',
      '🚕','🏍','📱','💻','📷','🎵','🎶',
    ],
  },
  {
    icon: '🍕',
    label: 'Food',
    emojis: [
      '🍕','🍔','🍟','🌭','🍿','🧀','🥚','🍳',
      '🥞','🧇','🍞','🥐','🥨','🥯','🥓','🍗',
      '🍖','🌮','🌯','🥙','🧆','🥘','🍲','🍜',
      '🍝',
    ],
  },
];

const EmojiPicker: React.FC<EmojiPickerProps> = ({ visible, onSelect, onClose }) => {
  const [activeCategory, setActiveCategory] = useState(0);

  if (!visible) return null;

  const currentCategory = CATEGORIES[activeCategory];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{currentCategory.label}</Text>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Text style={styles.closeText}>✕</Text>
        </TouchableOpacity>
      </View>

      {/* Category tabs */}
      <View style={styles.tabs}>
        {CATEGORIES.map((cat, index) => (
          <TouchableOpacity
            key={cat.label}
            onPress={() => setActiveCategory(index)}
            style={[
              styles.tab,
              activeCategory === index && styles.activeTab,
            ]}
          >
            <Text style={styles.tabEmoji}>{cat.icon}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Emoji grid */}
      <ScrollView
        style={styles.scrollArea}
        contentContainerStyle={styles.grid}
        showsVerticalScrollIndicator={false}
      >
        {currentCategory.emojis.map((emoji, index) => (
          <TouchableOpacity
            key={`${currentCategory.label}-${index}`}
            onPress={() => onSelect(emoji)}
            style={styles.emojiButton}
          >
            <Text style={styles.emoji}>{emoji}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const EMOJI_SIZE = `${100 / 8}%`;

const styles = StyleSheet.create({
  container: {
    height: 280,
    backgroundColor: '#fff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 10,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 4,
  },
  headerTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#555',
  },
  closeButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeText: {
    fontSize: 14,
    color: '#888',
    fontWeight: '600',
  },
  tabs: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e8e8e8',
    gap: 2,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: '#f0f0f0',
  },
  tabEmoji: {
    fontSize: 20,
  },
  scrollArea: {
    flex: 1,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  emojiButton: {
    width: EMOJI_SIZE as any,
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: {
    fontSize: 26,
  },
});

export default EmojiPicker;
