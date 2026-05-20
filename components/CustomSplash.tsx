import React, { useEffect, useRef } from "react";
import {
    Animated,
    Dimensions,
    StyleSheet,
    Text,
    View,
    Image,
} from "react-native";

const { width, height } = Dimensions.get("window");

const COLORS = {
    bg: "#091530",
    gold: "#c9a84c",
    text: "#ffffff",
};

export default function CustomSplash({ onFinish }: { onFinish: () => void }) {
    const opacity = useRef(new Animated.Value(0)).current;
    const scale = useRef(new Animated.Value(0.9)).current;
    const rotate = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        // Fade + scale animation
        Animated.parallel([
            Animated.timing(opacity, {
                toValue: 1,
                duration: 900,
                useNativeDriver: true,
            }),
            Animated.spring(scale, {
                toValue: 1,
                friction: 6,
                useNativeDriver: true,
            }),
        ]).start();

        // Loader rotation
        Animated.loop(
            Animated.timing(rotate, {
                toValue: 1,
                duration: 1200,
                useNativeDriver: true,
            })
        ).start();

        // Move to app after delay
        const timer = setTimeout(() => {
            onFinish();
        }, 2500);

        return () => clearTimeout(timer);
    }, []);

    const spin = rotate.interpolate({
        inputRange: [0, 1],
        outputRange: ["0deg", "360deg"],
    });

    return (
        <View style={styles.container}>
            {/* Fullscreen Image */}
            <Animated.Image
                source={require("../assets/images/icon.png")}
                style={[
                    styles.image,
                    ,
                ]}
                resizeMode="contain"
            />




        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.bg,
        justifyContent: "center",
        alignItems: "center",
    },

    image: {
        position: "absolute",
        width: width,
        height: height,
    },

    loader: {
        position: "absolute",
        bottom: 140,
        width: 50,
        height: 50,
        borderWidth: 3,
        borderColor: "rgba(255,255,255,0.1)",
        borderTopColor: COLORS.gold,
        borderRadius: 50,
    },

    loadingText: {
        position: "absolute",
        bottom: 90,
        color: COLORS.gold,
        fontSize: 13,
        letterSpacing: 2,
    },
});