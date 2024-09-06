import { StyleSheet, Text, TextInput, View } from "react-native";
import React from "react";
import { theme } from "../constants/theme";
import { hp } from "../helper/common";

const Input = ({ icon, onChangeText, containerStyle, ...props }) => {
	return (
		<View
			style={[
				styles.container,
				props.containerStyle && props.containerStyle,
				containerStyle,
			]}
		>
			{icon && icon}
			<TextInput
				style={{ flex: 1 }}
				placeholderTextColor={theme.colors.textLight}
				{...props}
				onChangeText={onChangeText} // Ensure onChangeText is used
			/>
		</View>
	);
};

export default Input;

const styles = StyleSheet.create({
	container: {
		flexDirection: "row",
		height: hp(7.2),
		alignItems: "center",
		justifyContent: "center",
		borderWidth: 0.4,
		borderColor: theme.colors.text,
		borderRadius: 22,
		paddingHorizontal: 18,
		gap: 12,
	},
});
