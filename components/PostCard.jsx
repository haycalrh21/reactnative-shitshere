import {
	Alert,
	Image,
	Share,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from "react-native";
import React, { useEffect, useState } from "react";
import { theme } from "../constants/theme";
import { hp, stripHtmlTags, wp } from "../helper/common";
import Avatar from "./Avatar";
import Icon from "../assets/icons";
import moment from "moment";
import RenderHTML from "react-native-render-html";
import { downloadFIle, getSupabaseFilePath } from "../services/imageServices";
import { Video } from "expo-av";
import { likePosts, removelikePosts } from "../services/postServices";
import getUserData from "../services/userServices"; // Import getUserData

const PostCard = ({
	post,
	currentUser,
	router,
	hasShadow = true,
	showMoreIcon = true,
	showDelete = false,
	onDelete = () => {},
	onEdit = () => {},
}) => {
	const [likes, setLikes] = useState(post?.postLikes || []);
	const [user, setUser] = useState(post?.user || {}); // State for user data

	useEffect(() => {
		setLikes(post?.postLikes || []);
	}, [post?.postLikes]);

	useEffect(() => {
		const fetchUser = async () => {
			if (post?.userId) {
				const res = await getUserData(post?.userId);
				if (res.success) {
					setUser(res.data);
				}
			}
		};

		fetchUser();
	}, [post?.userId]); // Fetch user data whenever post.userId changes

	const textStyles = {
		color: theme.colors.text,
		fontSize: hp(1.6),
	};
	const tagsStyles = {
		div: textStyles,
		p: textStyles,
		span: textStyles,
		a: { ...textStyles, color: theme.colors.primary },
		strong: textStyles,
	};

	const created_at = post?.created_at
		? moment(post?.created_at).format("MMM D")
		: "";

	const liked = likes.some((like) => like?.userId === currentUser?.id);

	const onLike = async () => {
		if (liked) {
			const updatedLikes = likes.filter(
				(like) => like?.userId !== currentUser?.id
			);
			setLikes(updatedLikes);

			const res = await removelikePosts(post?.id, currentUser?.id);
		} else {
			const data = {
				postId: post?.id,
				userId: currentUser?.id,
			};

			const existingLike = likes.find(
				(like) => like?.userId === currentUser?.id
			);
			if (!existingLike) {
				setLikes([...likes, data]);

				const res = await likePosts(data);
				if (!res) {
					Alert.alert("Error", "Failed to like the post");
				}
			} else {
				Alert.alert("Info", "You've already liked this post");
			}
		}
	};

	const onShare = async () => {
		let content = { message: stripHtmlTags(post?.body) };

		if (post?.file) {
			try {
				const fileUri = getSupabaseFilePath(post?.file)?.uri; // Periksa apakah fileUri valid
				if (!fileUri) {
					throw new Error("File URI is not valid");
				}

				const url = await downloadFIle(fileUri);

				if (url) {
					content.url = url;
				} else {
					Alert.alert("Error", "Failed to download file");
					return; // Keluar dari fungsi jika unduhan gagal
				}
			} catch (error) {
				console.error("Error getting file URL or downloading file:", error);
				Alert.alert("Error", "Failed to download file");
				return; // Keluar dari fungsi jika terjadi kesalahan
			}
		}

		try {
			await Share.share(content);
		} catch (error) {
			console.error("Error sharing content:", error);
			Alert.alert("Error", "Failed to share content");
		}
	};

	const openDetailPosts = () => {
		if (!showMoreIcon) return null;
		router.push({ pathname: "postDetails", params: { postId: post?.id } });
	};

	// Pastikan `post?.comments` adalah array dan memiliki elemen sebelum mengakses
	const commentCount =
		Array.isArray(post?.comments) && post?.comments.length > 0
			? post?.comments[0]?.count
			: 0;

	const handleDeletePost = async () => {
		Alert.alert("Hapus", "Apakah kamu yakin mau menhapousnya ?", [
			{
				text: "Cancel",
				onPress: () => console.log("Cancel Pressed"),
				style: "cancel",
			},
			{
				text: "Delete",
				onPress: () => onDelete(post),
			},
		]);
	};

	return (
		<View style={[styles.container, hasShadow && styles.shadow]}>
			<View style={styles.header}>
				<View style={styles.userInfo}>
					<Avatar uri={user?.image} size={hp(4.5)} rounded={theme.radius.sm} />
					<View style={{ gap: 2 }}>
						<Text style={styles.userName}>{user?.name}</Text>
						<Text style={styles.postTime}>{created_at}</Text>
					</View>
				</View>
				{showMoreIcon && (
					<TouchableOpacity onPress={openDetailPosts}>
						<Icon
							name='threeDotsHorizontal'
							size={hp(3.4)}
							strokeWidth={2.5}
							color={theme.colors.textLight}
						/>
					</TouchableOpacity>
				)}
				{showDelete && currentUser?.id === post?.userId && (
					<View style={styles.action}>
						<TouchableOpacity onPress={onEdit}>
							<Icon name='edit' size={hp(3.4)} color={theme.colors.textLight} />
						</TouchableOpacity>
						<TouchableOpacity onPress={handleDeletePost}>
							<Icon name='delete' size={hp(3.4)} color={theme.colors.rose} />
						</TouchableOpacity>
					</View>
				)}
			</View>
			<View style={styles.content}>
				<View style={styles.postBody}>
					{post?.body && (
						<RenderHTML
							contentWidth={wp(100)}
							source={{ html: post?.body }}
							tagsStyles={tagsStyles}
						/>
					)}
				</View>
				{post?.file && post?.file.includes("postImages") && (
					<Image
						source={getSupabaseFilePath(post?.file)}
						style={styles.postMedia}
						resizeMode='cover'
					/>
				)}
				{post?.file && post?.file.includes("postVideos") && (
					<Video
						source={getSupabaseFilePath(post?.file)}
						useNativeControls
						isLooping
						style={[styles.postMedia, { height: hp(40) }]}
						resizeMode='contain'
					/>
				)}
			</View>
			<View style={styles.footer}>
				<View style={styles.footerButton}>
					<TouchableOpacity onPress={onLike}>
						<Icon
							name='heart'
							size={24}
							color={liked ? "red" : theme.colors.textLight}
						/>
					</TouchableOpacity>
					<Text style={styles.count}>{likes.length}</Text>
				</View>
				<View style={styles.footerButton}>
					<TouchableOpacity onPress={openDetailPosts}>
						<Icon name='comment' size={24} color={theme.colors.textLight} />
					</TouchableOpacity>
					<Text style={styles.count}>{commentCount}</Text>
				</View>
				<View style={styles.footerButton}>
					<TouchableOpacity onPress={onShare}>
						<Icon name='share' size={24} color={theme.colors.textLight} />
					</TouchableOpacity>
				</View>
			</View>
		</View>
	);
};

export default PostCard;

const styles = StyleSheet.create({
	container: {
		gap: 10,
		marginBottom: 15,
		borderRadius: theme.radius.xxl * 1.1,
		borderCurve: "continuous",
		padding: 10,
		paddingVertical: 12,
		backgroundColor: "white",
		borderWidth: 0.5,
		borderColor: theme.colors.gray,
		shadowColor: theme.colors.textLight,
	},
	header: { flexDirection: "row", justifyContent: "space-between" },
	userInfo: { flexDirection: "row", alignItems: "center", gap: 8 },
	userName: {
		fontSize: hp(1.7),
		color: theme.colors.textDark,
		fontWeight: theme.fonts.medium,
	},
	postTime: {
		fontSize: hp(1.4),
		color: theme.colors.textLight,
		fontWeight: theme.fonts.medium,
	},
	content: { gap: 10 },
	postMedia: {
		height: hp(40),
		width: "100%",
		borderRadius: theme.radius.xl,
		borderCurve: "continuous",
	},
	postBody: { marginLeft: 5 },
	footer: {
		flexDirection: "row",
		gap: 15,
		alignItems: "center",
	},
	footerButton: {
		flexDirection: "row",
		alignItems: "center",

		gap: 4,
		marginLeft: 5,
	},

	action: {
		flexDirection: "row",
		alignItems: "center",
		gap: 18,
	},
	count: {
		color: theme.colors.text,
		fontSize: hp(1.8),
	},
});
