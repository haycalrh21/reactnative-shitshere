import {
	Alert,
	FlatList,
	Pressable,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from "react-native";
import React, { useEffect, useState } from "react";
import ScreenWrapper from "../../components/ScreenWrapper";
import { useRouter } from "expo-router";
import { useAuth } from "../../context/authContext";
import Header from "../../components/Header";
import { hp, wp } from "../../helper/common";
import Icon from "../../assets/icons";
import Edit from "../../assets/icons/Edit";
import { theme } from "../../constants/theme";
import Supabase from "../../lib/supabase";
import Avatar from "../../components/Avatar";
import getUserData from "../../services/userServices";
import { fetchPost } from "../../services/postServices";
import PostCard from "../../components/PostCard";
import Loading from "../../components/Loading";

var limit = 10;

const Profile = () => {
	const router = useRouter();
	const [posts, setPosts] = useState([]);
	const [hasMore, setHasMore] = useState(true);

	const getPosts = async () => {
		// if (!hasMore) return; // Anda bisa mengaktifkan ini jika ingin mencegah fetch saat tidak ada lagi data

		// Menambah limit sebelum pengambilan postingan baru
		limit += 4;

		let res = await fetchPost(limit, user?.id);
		if (res) {
			// Memeriksa apakah jumlah postingan yang diterima kurang dari limit, yang berarti tidak ada postingan lagi
			if (res.length < limit) {
				setHasMore(false);
			}

			// Hanya menambahkan postingan baru yang belum ada dalam state
			const uniquePosts = res.filter(
				(post) => !posts.some((p) => p.id === post.id)
			);
			setPosts([...posts, ...uniquePosts]);
		} else {
			console.error("Failed to fetch posts");
		}
	};

	const { user } = useAuth(); // Pastikan setUserData diambil dari context

	return (
		<ScreenWrapper>
			<FlatList
				data={posts}
				ListHeaderComponent={
					<UserHeader user={user} router={router} handleLogout={handleLogout} />
				}
				ListHeaderComponentStyle={{ marginBottom: 30 }}
				showsVerticalScrollIndicator={false}
				contentContainerStyle={styles.listStyle}
				keyExtractor={(item) => item.id.toString()} // Pastikan `item.id` adalah string atau number
				renderItem={({ item }) => (
					<PostCard post={item} currentUser={user} router={router} />
				)}
				onEndReached={getPosts} // Mengambil postingan berikutnya ketika scroll mencapai akhir
				onEndReachedThreshold={0.1} // Memicu pengambilan data saat mendekati akhir list
				ListFooterComponent={
					hasMore ? (
						<View style={{ marginVertical: posts.length === 0 ? 200 : 30 }}>
							<Loading />
						</View>
					) : (
						<View style={{ marginVertical: 30 }}>
							<Text style={styles.noPosts}>Tidak Ada Lagi</Text>
						</View>
					)
				}
			/>
		</ScreenWrapper>
	);
};
const onLogout = () => {
	const { error } = Supabase.auth.signOut();
	if (error) {
		console.log(error);
	}
};
const handleLogout = async () => {
	Alert.alert("Logout", "Are you sure you want to logout?", [
		{
			text: "Cancel",
			onPress: () => console.log("Cancel Pressed"),
			style: "cancel",
		},
		{
			text: "OK",
			onPress: () => onLogout(),
		},
	]);
};

const UserHeader = ({ user, router }) => {
	return (
		<View
			style={{ flex: 1, backgroundColor: "White", paddingHorizontal: wp(4) }}
		>
			<View>
				<Header title='Profile' showBackButton={true} />
				<TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
					<Icon name='logout' size={wp(5)} strokeWidth={2.5} />
				</TouchableOpacity>
			</View>
			<View style={styles.container}>
				<View style={{ gap: 15 }}>
					<View style={styles.avatarContainer}>
						<Avatar uri={user?.image} size={hp(12)} rounded={22 * 1.4} />
						<Pressable
							style={styles.editIcon}
							onPress={() => router.push("/editProfile")}
						>
							<Icon name={"edit"} size={20} strokeWidth={2.5} />
						</Pressable>
					</View>
					{/* User Name */}
					<View style={{ alignItems: "center", gap: 4 }}>
						<Text style={styles.userName}>{user?.name}</Text>
					</View>
					{/* Info */}
					<View style={{ gap: 10 }}>
						{user && user.email && (
							<View style={styles.info}>
								<Icon name='mail' size={20} />
								<Text style={styles.infoText}>{user?.email}</Text>
							</View>
						)}
						{user && user.phoneNumber && (
							<View style={styles.info}>
								<Icon name='call' size={20} />
								<Text style={styles.infoText}>{user?.phoneNumber}</Text>
							</View>
						)}
						{user && user.bio && (
							<View style={styles.info}>
								<Text style={styles.infoText}>{user?.bio}</Text>
							</View>
						)}
					</View>
				</View>
			</View>
		</View>
	);
};
export default Profile;

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	headerContainer: {
		marginHorizontal: wp(4),
		marginBottom: 20,
	},
	headerShape: {
		width: wp(100),
		height: hp(20),
	},
	avatarContainer: {
		height: hp(12),
		width: hp(12),
		alignSelf: "center",
	},
	editIcon: {
		position: "absolute",
		bottom: 0,
		right: -12,
		padding: 7,
		borderRadius: 50,
		backgroundColor: "white",
		shadowColor: theme.colors.textLight,
		shadowOffset: {
			width: 0,
			height: 4,
		},
		shadowOpacity: 0.4,
		shadowRadius: 5,
		elevation: 7,
	},
	userName: {
		fontSize: hp(3),
		fontWeight: 500,
		color: theme.colors.dark,
	},
	info: { flexDirection: "row", alignItems: "center", gap: 10 },
	infoText: {
		fontSize: hp(1.6),
		fontWeight: 500,
		color: theme.colors.textLight,
	},
	logoutButton: {
		position: "absolute",
		padding: 5,
		borderRadius: 12,
		backgroundColor: "#fee2e2",
		right: 0,
	},
	listStyle: {
		paddingHorizontal: wp(4),
		paddingBottom: 30,
	},
	noPosts: {
		fontSize: hp(2),
		textAlign: "center",
		color: theme.colors.text,
	},
});
