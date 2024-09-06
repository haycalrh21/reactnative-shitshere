import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import React from "react";
import { hp } from "../helper/common";
import { theme } from "../constants/theme";
import Avatar from "./Avatar";
import moment from "moment";
import Icon from "../assets/icons";

const CommentItem = ({ comment, canDelete = true, onDelete = () => {} }) => {
	console.log(comment);

	const tanggal = moment(comment?.created_at).format("MMM d");
	const deleteComment = () => {
		Alert.alert("Hapus", "Apakah kamu yakin mau menhapousnya ?", [
			{
				text: "Cancel",
				onPress: () => console.log("Cancel Pressed"),
				style: "cancel",
			},
			{
				text: "Delete",
				onPress: () => onDelete(comment),
			},
		]);
	};

	return (
		<View style={styles.container}>
			<Avatar uri={comment?.user?.image} />
			<View style={styles.content}>
				<View
					style={{
						flexDirection: "row",
						alignItems: "center",
						justifyContent: "space-between",
					}}
				>
					<View style={styles.nameContainer}>
						<Text style={styles.text}>{comment?.user?.name}</Text>
						<Text>.</Text>
						<Text style={styles.text}>{tanggal}</Text>
					</View>
					{canDelete && (
						<TouchableOpacity onPress={deleteComment}>
							<Icon name='delete' size={20} color={theme.colors.rose} />
						</TouchableOpacity>
					)}
				</View>
				<Text style={styles.text}>{comment?.text}</Text>
			</View>
		</View>
	);
};

export default CommentItem;
const styles = StyleSheet.create({
	container: { flex: 1, gap: 17, flexDirection: "row" },
	content: {
		backgroundColor: "#B7B1B1",
		flex: 1,
		gap: 5,
		paddingHorizontal: 14,
		paddingVertical: 10,
		borderCurve: "continuous",
		borderRadius: 14,
	},
	highLight: {
		borderWidth: 0.4,
		borderColor: theme.colors.dark,
		shadowColor: theme.colors.dark,
		shadowOpacity: 0.2,
		shadowRadius: 8,
		borderRadius: 10,
		elevation: 5,
	},
	nameContainer: { gap: 3, flexDirection: "row", alignItems: "center" },
	text: {
		fontSize: hp(1.5),
		fontWeight: theme.fonts.medium,
		color: theme.colors.textDark,
	},
});
