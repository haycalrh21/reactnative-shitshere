import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import React from "react";
import { theme } from "../constants/theme";
import { hp } from "../helper/common";
import Avatar from "./Avatar";
import moment from "moment";
import { useRouter } from "expo-router";

const NotificationItem = ({ item, router }) => {
	const handleClick = () => {
		// Implement navigation or action on click

		let { postId, commentId } = JSON.parse(item?.data);
		router.push({ pathname: "postDetails", params: { postId, commentId } });
	};

	const created_at = moment(item?.created_at).format("MMM D, YYYY");
	return (
		<TouchableOpacity style={styles.container} onPress={handleClick}>
			<Avatar uri={item?.sender?.image} size={hp(5)} />
			<View style={styles.details}>
				<Text style={styles.senderName}>{item?.sender?.name}</Text>
				<Text style={styles.title}>{item?.title}</Text>
			</View>
			<Text style={styles.timestamp}>{created_at}</Text>
		</TouchableOpacity>
	);
};

export default NotificationItem;

const styles = StyleSheet.create({
	container: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		backgroundColor: "#ffffff",
		borderWidth: 1,
		borderColor: theme.colors.lightGray,
		padding: 15,
		borderRadius: 10,
		marginVertical: 5,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.1,
		shadowRadius: 4,
		elevation: 2, // For Android shadow
	},
	details: { flex: 1, marginLeft: 10 },
	senderName: {
		fontSize: hp(2.0),
		fontWeight: "bold",
		color: theme.colors.primary,
	},
	title: {
		fontSize: hp(1.8),
		color: theme.colors.text,
	},
	timestamp: {
		fontSize: hp(1.6),
		color: theme.colors.text,
	},
});
