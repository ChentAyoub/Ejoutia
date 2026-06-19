import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
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
              style={[styles.tab, isActive ? styles.activeTab : styles.inactiveTab]}
              activeOpacity={0.6}
            >
              <Text style={[styles.tabEmoji, !isActive && styles.inactiveTabEmoji]}>
                {cat.icon}
              </Text>
              {isActive && <View style={styles.activeIndicator} />}
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
    backgroundColor: Brand.surface,
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
    position: 'relative',
  },
  activeTab: {
    backgroundColor: `${Brand.primary}15`,
  },
  inactiveTab: {
    backgroundColor: 'transparent',
  },
  activeIndicator: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: Brand.primary,
    borderBottomLeftRadius: Radius.md,
    borderBottomRightRadius: Radius.md,
  },
  tabEmoji: {
    fontSize: 20,
    zIndex: 1,
    color: Brand.text,
  },
  inactiveTabEmoji: {
    opacity: 0.5,
    color: Brand.subText,
  },
  closeButton: {
    width: 30,
    height: 30,
    borderRadius: Radius.full,
    backgroundColor: Brand.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeText: {
    fontSize: 14,
    color: Brand.text,
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
