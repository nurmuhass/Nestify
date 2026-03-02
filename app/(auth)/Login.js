import { useRouter } from "expo-router";
import { useContext, useState } from "react";
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { AuthContext } from "../../store";

export default function LoginScreen() {
  const router = useRouter();
  const { signIn } = useContext(AuthContext); // ✅ use from context
  const [emailOrPhone, setEmailOrPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!emailOrPhone || !password) {
      Alert.alert("Error", "Please fill all fields");
      return;
    }
    setLoading(true);
    const res = await signIn({ emailOrPhone, password }); // ✅ from context
    setLoading(false);
    if (res.error) {
      Alert.alert("Login failed", res.error);
      console.log("Login error:", res.error);
    } else {
      router.replace("/(tabs)/Home");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome Back</Text>
      <TextInput
        style={styles.input}
        placeholder="Email or Phone"
        value={emailOrPhone}
        onChangeText={setEmailOrPhone}
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
        <Text style={styles.buttonText}>{loading ? "Logging in..." : "Login"}</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => router.push("./Register")}>
        <Text style={styles.link}>Don't have an account? Register</Text>
      </TouchableOpacity>
    </View>
  );
}


const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: "center" },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 20, textAlign: "center" },
  input: {
    borderWidth: 1, borderColor: "#ccc", borderRadius: 8, padding: 12, marginBottom: 12,
  },
  button: {
    backgroundColor: "#007bff", padding: 14, borderRadius: 8, alignItems: "center", marginBottom: 12,
  },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  link: { color: "#007bff", textAlign: "center", marginTop: 8 },
});
