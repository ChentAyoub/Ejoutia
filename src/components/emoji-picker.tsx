import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Brand, Radius, Shadow } from '../constants/theme';

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
    label: 'Gestes',
    emojis: [
      '👋','🤚','🖐','✋','🖖','👌','🤌','🤏',
      '✌','🤞','🤟','🤘','🤙','👈','👉','👆',
      '🖕','👇','☝','👍','👎','✊','👊','🤛',
      '🤜','👏','🙌','👐','🤲','🤝','🙏',
    ],
  },
  {
    icon: '❤️',
    label: 'Cœurs',
    emojis: [
      '❤️','🧡','💛','💚','💙','💜','🖤','🤍',
      '🤎','💔','❣️','💕','💞','💓','💗','💖',
      '💘','💝',
    ],
  },
  {
    icon: '🎉',
    label: 'Objets',
    emojis: [
      '🎉','🎊','🎁','🎈','🔥','⭐','💫','✨',
      '🌟','💯','💰','💵','💸','🏠','🏡','🚗',
      '🚕','🏍','📱','💻','📷','🎵','🎶',
    ],
  },
  {
    icon: '🍕',
    label: 'Nourriture',
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
      {/* Category tabs */}
      <View style={styles.tabs}>
        {CATEGORIES.map((cat, index) => {
          const isActive = activeCategory === index;
          return (
            <TouchableOpacity
              key={cat.label}
              onPress={() => setActiveCategory(index)}
              style={styles.tab}
              activeOpacity={0.6}
            >
              {isActive && (
                <LinearGradient
                  colors={[`${Brand.coral}20`, `${Brand.orange}20`]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={StyleSheet.absoluteFill}
                />
              )}
              <Text style={styles.tabEmoji}>{cat.icon}</Text>
            </TouchableOpacity>
          );
        })}
        <View style={{ flex: 1 }} />
        <TouchableOpacity onPress={onClose} style={styles.closeButton} activeOpacity={0.6}>
          <Text style={styles.closeText}>✕</Text>
        </TouchableOpacity>
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
            activeOpacity={0.5}
          >
            <Text style={styles.emoji}>{emoji}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 270,
    backgroundColor: Brand.white,
    borderTopLeftRadius: Radius.xl,
    borderTopRightRadius: Radius.xl,
    ...Shadow.lg,
    shadowOffset: { width: 0, height: -4 },
  },
  tabs: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Brand.grayLight,
    gap: 4,
    alignItems: 'center',
  },
  tab: {
    width: 40,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radius.md,
    overflow: 'hidden',
  },
  tabEmoji: {
    fontSize: 20,
    zIndex: 1,
  },
  closeButton: {
    width: 30,
    height: 30,
    borderRadius: Radius.full,
    backgroundColor: Brand.warmGray,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeText: {
    fontSize: 13,
    color: Brand.grayDark,
    fontWeight: '600',
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
    width: '12.5%',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: {
    fontSize: 28,
  },
});

export default EmojiPicker;
