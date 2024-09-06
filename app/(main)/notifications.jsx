import { ScrollView, StyleSheet, Text, View } from "react-native";
import React, { useEffect, useState } from "react";
import { fetchNotification } from "../../services/notificationServices";
import { useAuth } from "../../context/authContext";
import { hp, wp } from "../../helper/common";
import { theme } from "../../constants/theme";
import ScreenWrapper from "../../components/ScreenWrapper";
import NotificationItem from "../../components/NotificationItem";
import Header from "../../components/Header";
import { useRouter } from "expo-router"; // Import useRouter

const Notification = () => {
	const [notification, setNotification] = useState([]);
	const { user } = useAuth();
	const router = useRouter(); // Get router here

	useEffect(() => {
		getNotif();
	}, []);

	const getNotif = async () => {
		try {
			const { success, data } = await fetchNotification(user.id);
			if (success) {
				setNotification(data);
			} else {
				console.error("Failed to fetch notifications");
			}
		} catch (error) {
			console.error("Error fetching notifications:", error);
		}
	};

	return (
		<ScreenWrapper>
			<View style={styles.container}>
				<Header title={"Notifications"} />
				<ScrollView
					showsVerticalScrollIndicator={false}
					contentContainerStyle={styles.listStyle}
				>
					{notification.length === 0 ? (
						<Text style={styles.noData}>No notifications</Text>
					) : (
						notification.map((item) => (
							<NotificationItem item={item} key={item.id} router={router} />
						))
					)}
				</ScrollView>
			</View>
		</ScreenWrapper>
	);
};

export default Notification;

const styles = StyleSheet.create({
	container: {
		flex: 1,
		paddingHorizontal: wp(4),
	},
	listStyle: {
		paddingVertical: 20,
		gap: 10,
	},
	noData: {
		fontSize: hp(2),
		fontWeight: theme.fonts.medium,
		color: theme.colors.text,
		textAlign: "center",
	},
});
