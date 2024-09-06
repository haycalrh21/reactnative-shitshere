import { View, Text } from "react-native";
import React from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";

const ScreenWrapper = ({ children, bg }) => {
	const { top } = useSafeAreaInsets();

	const paddingtop = top > 0 ? top + 5 : 30;
	return (
		<View style={{ flex: 1, paddingTop: paddingtop, backgroundColor: bg }}>
			{children}
		</View>
	);
};

export default ScreenWrapper;
