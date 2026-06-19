import { View, Text, StyleSheet } from "react-native";
import { Brand } from "../../constants/theme";

export default function ProfilScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Mon Profil</Text>
      <Text style={styles.subtitle}>Profile settings go here.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Brand.bgDark,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: Brand.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: Brand.subText,
  },
});
