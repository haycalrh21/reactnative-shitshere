import {
	StyleSheet,
	View,
	ScrollView,
	Text,
	TouchableOpacity,
	Alert,
	KeyboardAvoidingView,
	Platform,
} from "react-native";
import React, { useEffect, useRef, useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
	createComment,
	getDetailPost,
	removeComment,
	removePosts,
} from "../../services/postServices";
import { hp, wp } from "../../helper/common";
import PostCard from "../../components/PostCard";
import { useAuth } from "../../context/authContext";
import Loading from "../../components/Loading";
import { theme } from "../../constants/theme";
import Input from "../../components/Input";
import Icon from "../../assets/icons";
import CommentItem from "../../components/CommentItem";
import Supabase from "../../lib/supabase";
import getUserData from "../../services/userServices";
import { createNotification } from "../../services/notificationServices";

const PostDetails = () => {
	const { postId } = useLocalSearchParams();
	const { user } = useAuth();
	const router = useRouter();
	const [post, setPost] = useState(null);
	const [startLoadingHalaman, setStartLoadingHalaman] = useState(true);
	const [loading, setLoading] = useState(false);
	const inputRef = useRef(null);
	const commentRef = useRef("");

	const fetchPost = async () => {
		try {
			const res = await getDetailPost(postId);
			// console.log("Fetched post:", res);
			setPost(res);
		} catch (error) {
			console.error("Error fetching post:", error);
		} finally {
			setStartLoadingHalaman(false);
		}
	};
	const handleNewComment = async (payload) => {
		if (payload.new) {
			let newComment = { ...payload.new };
			let res = await getUserData(newComment.userId);
			newComment.user = res.success ? res.data : null;

			setPost((prevPost) => {
				if (prevPost) {
					return {
						...prevPost,
						comments: [newComment, ...prevPost.comments],
					};
				}
				return prevPost;
			});
		}
	};

	useEffect(() => {
		const commentChannel = Supabase.channel("comments")
			.on(
				"postgres_changes",
				{
					event: "INSERT",
					schema: "public",
					table: "comments",
					filter: `postId=eq.${postId}`,
				},
				handleNewComment
			)
			.subscribe();

		fetchPost();

		return () => {
			Supabase.removeChannel(commentChannel);
		};
	}, [postId]);

	if (startLoadingHalaman) {
		return (
			<View style={styles.center}>
				<Loading />
			</View>
		);
	}

	if (!post) {
		return (
			<View style={styles.center}>
				<Text>Post not found</Text>
			</View>
		);
	}
	const onComment = async () => {
		if (!commentRef.current) return;

		let data = {
			text: commentRef.current,
			userId: user?.id,
			postId: post?.id,
		};

		setLoading(true);

		let res = await createComment(data);
		setLoading(false);

		if (res) {
			if (user?.id !== post?.userId) {
				let notify = {
					senderId: user?.id,
					receiveId: post?.userId,
					title: "New Comment",
					data: JSON.stringify({ postId: post?.id, commentId: res?.data?.id }),
				};

				const notificationRes = await createNotification(notify);
				if (notificationRes.success) {
					console.log("Notification berhasil dibuat:", notificationRes.data);
				}
			}

			inputRef?.current?.clear();
			commentRef.current = "";
		} else {
			Alert.alert("Error", "Failed to comment");
		}
	};

	const onDeleteComment = async (comment) => {
		// console.log("Attempting to delete comment with ID:", comment?.id);

		if (!comment?.id) {
			console.error("No comment ID provided");
			Alert.alert("Error", "Invalid comment ID");
			return;
		}

		try {
			let res = await removeComment(comment?.id);
			if (res !== null) {
				setPost((prevPost) => {
					// Update post state by removing the deleted comment
					let updatedPost = { ...prevPost };
					updatedPost.comments = updatedPost.comments.filter(
						(c) => c.id !== comment.id
					);
					return updatedPost;
				});
			} else {
				Alert.alert("Error", "Failed to delete comment");
			}
		} catch (error) {
			console.error("Error deleting comment:", error);
			Alert.alert("Error", "Failed to delete comment");
		}
	};

	const onDeletePost = async (post) => {
		let res = await removePosts(post?.id);
		if (res) {
			router.back();
		} else {
			Alert.alert("Error", "Failed to delete post");
		}
	};

	const onEditPost = async () => {};

	return (
		<KeyboardAvoidingView
			behavior={Platform.OS === "ios" ? "padding" : "height"}
			keyboardVerticalOffset={Platform.OS === "ios" ? hp(7) : 0}
		>
			<ScrollView
				contentContainerStyle={styles.list}
				showsVerticalScrollIndicator={false}
			>
				<PostCard
					post={{ ...post, comments: [{ count: post?.comments?.length }] }}
					currentUser={user}
					router={router}
					hasShadow={false}
					showMoreIcon={false}
					showDelete={true}
					onDelete={onDeletePost}
					onEdit={onEditPost}
				/>

				{/* section komen */}
				<View style={styles.inputContainer}>
					<Input
						inputRef={inputRef}
						onChangeText={(value) => (commentRef.current = value)}
						placeholder='Tulis komentar...'
						placeholderTextColor={theme.colors.text}
						containerStyle={{ flex: 1, height: hp(7), width: wp(80) }}
					/>
					{loading ? (
						<View style={styles.loading}>
							<Loading size='small' />
						</View>
					) : (
						<TouchableOpacity style={styles.sendIcone} onPress={onComment}>
							<Icon name='send' color={theme.colors.primaryDark} />
						</TouchableOpacity>
					)}
				</View>
				{/* kommen orang */}
				<View style={{ marginVertical: 15, gap: 17 }}>
					{post?.comments?.map((comment) => (
						<CommentItem
							key={comment?.id?.toString()}
							comment={comment}
							onDelete={onDeleteComment}
							canDelete={user.id === comment.userId || user.id === post.userId}
							// currentUser={user}
						/>
					))}
					{post?.comments?.length === 0 && (
						<View style={{ color: theme.colors.text, marginLeft: 5 }}>
							<Text>Jadilah Komen Yang Pertama!</Text>
						</View>
					)}
				</View>
			</ScrollView>
		</KeyboardAvoidingView>
	);
};

export default PostDetails;

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "white",
		paddingVertical: wp(7),
	},
	title: {
		fontSize: 18,
		fontWeight: "bold",
	},
	loading: {
		height: hp(5.8),
		width: hp(5.8),
		justifyContent: "center",
		alignItems: "center",
		transform: [{ scale: 1.3 }],
	},
	notfound: {
		fontSize: hp(2.5),
		color: theme.colors.text,
		fontWeight: theme.fonts.medium,
	},
	center: { flex: 1, alignItems: "center", justifyContent: "center" },
	sendIcone: {
		alignItems: "center",
		justifyContent: "center",
		borderWidth: 0.8,
		borderColor: theme.colors.primary,
		borderRadius: 16,
		borderCurve: "continuous",
		height: hp(5.8),
		width: hp(5.8),
	},
	list: {
		paddingHorizontal: wp(4),
	},
	inputContainer: {
		flexDirection: "row",
		alignItems: "center",
		gap: 10,
	},
});
