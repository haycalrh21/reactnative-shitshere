import {
	FlatList,
	Pressable,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from "react-native";
import React, { useEffect, useState } from "react";
import ScreenWrapper from "../../components/ScreenWrapper";
import Button from "../../components/Button";
import { useAuth } from "../../context/authContext";
import Supabase from "../../lib/supabase";
import { hp, wp } from "../../helper/common";
import { theme } from "../../constants/theme";
import Icon from "../../assets/icons";
import { useRouter } from "expo-router";
import Avatar from "../../components/Avatar";
import { fetchPost } from "../../services/postServices";
import PostCard from "../../components/PostCard";
import Loading from "../../components/Loading";
import getUserData from "../../services/userServices";
import { StatusBar } from "expo-status-bar";

var limit = 2;
const Home = () => {
	const { user, setAuth } = useAuth();
	const [posts, setPosts] = useState([]);
	const [hasMore, setHasMore] = useState(true);
	const handlePostEvent = async (payload) => {
		if (payload.eventType === "INSERT" && payload?.new?.id) {
			let newPost = { ...payload.new };
			let res = await getUserData(newPost.userId);
			newPost.postLikes = [];
			newPost.comments = [{ count: 0 }];
			newPost.user = res.success ? res.data : {};
			setPosts((prevPosts) => [newPost, ...prevPosts]);
		}
		if (payload.eventType === "DELETE" && payload?.old?.id) {
			setPosts((prevPosts) =>
				prevPosts.filter((post) => post.id !== payload.old.id)
			);
		}
	};

	useEffect(() => {
		const postChannel = Supabase.channel("posts")
			.on(
				"postgres_changes",
				{ event: "*", schema: "public", table: "posts" },
				handlePostEvent
			)
			.subscribe();

		const userChannel = Supabase.channel("users")
			.on(
				"postgres_changes",
				{ event: "*", schema: "public", table: "users" },
				(payload) => {
					if (payload.eventType === "UPDATE") {
						// Update user data in posts if necessary
						setPosts((prevPosts) =>
							prevPosts.map((post) =>
								post.userId === payload.new.id
									? { ...post, user: payload.new }
									: post
							)
						);
					}
				}
			)
			.subscribe();

		return () => {
			Supabase.removeChannel(postChannel);
			Supabase.removeChannel(userChannel);
		};
	}, []);

	const getPosts = async () => {
		// if (!hasMore) return; // Anda bisa mengaktifkan ini jika ingin mencegah fetch saat tidak ada lagi data

		// Menambah limit sebelum pengambilan postingan baru
		limit += 4;

		let res = await fetchPost(limit);
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

	const router = useRouter();
	return (
		<ScreenWrapper>
			<StatusBar style='dark' />

			<View style={styles.container}>
				{/* header */}
				<View style={styles.header}>
					<Text style={styles.title}>SHitSHere !</Text>
					<View style={styles.icons}>
						<Pressable onPress={() => router.push("/notifications")}>
							<Icon
								name='heart'
								size={hp(3.2)}
								strokeWidth={2.5}
								color={theme.colors.text}
							/>
						</Pressable>
						<Pressable onPress={() => router.push("/createpost")}>
							<Icon
								name='plus'
								size={hp(3.2)}
								strokeWidth={2.5}
								color={theme.colors.text}
							/>
						</Pressable>
						<Pressable onPress={() => router.push("/profile")}>
							<Avatar
								uri={user?.image}
								size={hp(4.3)}
								rounded={12}
								style={{ borderWidth: 2 }}
							/>
						</Pressable>
					</View>
				</View>
				<FlatList
					data={posts}
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
			</View>
			{/* <Button title='logout' onPress={onSubmit} /> */}
		</ScreenWrapper>
	);
};

export default Home;

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	listStyle: {
		paddingTop: 20,
		paddingHorizontal: wp(4),
	},
	header: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		marginBottom: 10,
		marginHorizontal: wp(4),
	},
	title: {
		color: theme.colors.text,
		fontWeight: theme.fonts.bold,
		fontSize: hp(3.2),
	},
	avatarImage: {
		height: hp(4.3),
		width: hp(4.3),
		borderRadius: 12,
		borderCurve: "continuous",
		borderColor: theme.colors.gray,
		borderWidth: 3,
	},
	icons: {
		flexDirection: "row",
		justifyContent: "center",
		alignItems: "center",
		gap: 18,
	},
	noPosts: {
		fontSize: hp(2),
		textAlign: "center",
		color: theme.colors.text,
	},
	pill: {
		position: "absolute",
		right: -10,
		top: -4,
		height: hp(2.2),
		width: hp(2.2),
		justifyContent: "center",
		alignItems: "center",
		borderRadius: 20,
		backgroundColor: theme.colors.roseLight,
	},
	pilltext: {
		color: "white",
		fontSize: hp(1.2),
		fontWeight: theme.fonts.bold,
	},
});
