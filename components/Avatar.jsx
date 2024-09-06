import { StyleSheet, View } from "react-native";
import React from "react";
import { hp } from "../helper/common";
import { theme } from "../constants/theme";
import { Image } from "expo-image";
import { getUserImage } from "../services/imageServices";

const Avatar = ({ uri, size = hp(4.5), rounded = 12, style = {} }) => {
	return (
		<Image
			transition={100}
			source={getUserImage(uri)}
			style={[
				styles.avatar,
				{ width: size, height: size, borderRadius: rounded },
				style,
			]}
		/>
	);
};

export default Avatar;

const styles = StyleSheet.create({
	avatar: {
		borderCurve: "continuous",
		borderColor: theme.colors.darkLight,
		borderWidth: 1,
	},
});
