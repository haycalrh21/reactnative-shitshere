import {
	Pressable,
	ScrollView,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from "react-native";
import React, { useRef, useState } from "react";
import ScreenWrapper from "../../components/ScreenWrapper";
import Header from "../../components/Header";
import { hp } from "../../helper/common";
import { theme } from "../../constants/theme";
import Avatar from "../../components/Avatar";
import { useAuth } from "../../context/authContext";
import RichTextEditor from "../../components/RichTextEditor";
import { useRouter } from "expo-router";
import Icon from "../../assets/icons";
import Button from "../../components/Button";
import * as ImagePicker from "expo-image-picker";
import { Image } from "expo-image";
import { Video } from "expo-av";
import { createPost } from "../../services/postServices";

const NewPosts = () => {
	const { user } = useAuth();
	const bodyRef = useRef("");
	const editorRef = useRef(null);
	const router = useRouter();
	const [loading, setLoading] = useState(false);
	const [file, setFile] = useState(null);
	const getFileNameFromUri = (uri) => {
		const parts = uri.split("/");
		return parts[parts.length - 1];
	};
	const onPick = async (isImage) => {
		let mediaConfig = {
			mediaTypes: isImage
				? ImagePicker.MediaTypeOptions.Images
				: ImagePicker.MediaTypeOptions.Videos,
			allowsEditing: true,
			aspect: isImage ? [4, 3] : undefined,
			quality: isImage ? 0.7 : undefined,
		};

		let result = await ImagePicker.launchImageLibraryAsync(mediaConfig);

		if (!result.canceled) {
			setFile(result.assets[0].uri);
			// console.log("Gambar atau video berhasil dipilih:", result.assets[0].uri);
		} else {
			console.log("Pemilihan gambar atau video dibatalkan.");
		}
	};

	const isLocalFile = (file) => {
		return typeof file === "string"; // URI adalah string
	};

	const getFIleType = (file) => {
		if (!file) return null;
		if (isLocalFile(file)) {
			return file.endsWith(".mp4") || file.endsWith(".mov") ? "video" : "image";
		}
		return null;
	};

	const getFileUri = (file) => {
		return file; // URI sudah benar
	};

	const formatFilePath = (fileName, isImage) => {
		return isImage ? `postImages/${fileName}` : `postVideos/${fileName}`;
	};

	const onSubmit = async () => {
		if (!bodyRef.current || !file) {
			Alert.alert("Error", "Please fill all the fields");
			return;
		}

		const fileName = getFileNameFromUri(file);
		const isImage = getFIleType(file) === "image";
		const filePath = formatFilePath(fileName, isImage); // Format path sesuai dengan folder

		let data = {
			body: bodyRef.current,
			userId: user.id,
			file: file, // Gunakan path yang sesuai
		};

		setLoading(true);
		let res = await createPost(data);
		setLoading(false);
		if (res) {
			router.back();
		}
	};

	return (
		<ScreenWrapper>
			<View style={styles.container}>
				{/* Header with back button */}
				<Header title='Create Post' showBackButton={true} />

				{/* ScrollView for main content */}
				<ScrollView contentContainerStyle={styles.scrollViewContent}>
					{/* Avatar section */}
					<View style={styles.header}>
						<Avatar uri={user?.image} size={hp(6.5)} rounded={12} />
						<View style={{ gap: 2 }}>
							<Text style={styles.userName}> {user?.name}</Text>
						</View>
					</View>
					<View style={styles.textEditor}>
						<RichTextEditor
							editorRef={editorRef}
							onChange={(body) => (bodyRef.current = body)}
						/>
					</View>
					{file && (
						<View style={styles.file}>
							{getFIleType(file) === "video" ? (
								<Video
									source={{ uri: getFileUri(file) }}
									style={{ flex: 1 }}
									useNativeControls
									isLooping
								/>
							) : (
								<Image
									source={{ uri: getFileUri(file) }}
									resizeMode='cover'
									style={{ flex: 1 }}
								/>
							)}
							<Pressable style={styles.closeIcon} onPress={() => setFile(null)}>
								<Icon name='delete' size='25' color='red' />
							</Pressable>
						</View>
					)}

					<View style={styles.media}>
						<Text style={styles.publicText}>Tambahkan Gambar atau Video</Text>
						<View style={styles.mediaIcons}>
							<TouchableOpacity onPress={() => onPick(true)}>
								<Icon name={"image"} size={hp(3.5)} strokeWidth={2.5} />
							</TouchableOpacity>
							<TouchableOpacity onPress={() => onPick(false)}>
								<Icon name={"video"} size={hp(3.5)} strokeWidth={2.5} />
							</TouchableOpacity>
						</View>
					</View>
				</ScrollView>
				<Button
					title='Post'
					loading={loading}
					hasShadow={false}
					onPress={onSubmit}
					buttonStyle={{ height: hp(6.2) }}
				/>
			</View>
		</ScreenWrapper>
	);
};

export default NewPosts;

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	scrollViewContent: {
		padding: 20, // Ensure content in ScrollView has proper padding
	},
	header: {
		gap: 12,
		flexDirection: "row",
		alignItems: "center",
	},
	userName: {
		fontSize: hp(2.5),
		fontWeight: theme.fonts.semibold,
		color: theme.colors.text,
	},
	avatar: {
		height: hp(6.5),
		width: hp(6.5),
		borderRadius: 18,
		borderCurve: "continuous",
		borderWidth: 1,
		borderColor: theme.colors.darkLight,
	},
	publicText: {
		fontSize: hp(1.7),
		fontWeight: theme.fonts.medium,
		color: theme.colors.textLight,
	},
	textEditor: {
		minHeight: hp(30), // Adjust height if needed
	},
	media: {
		padding: 12,
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		borderWidth: 1.5,
		paddingHorizontal: 18,
		borderRadius: 18,
		borderCurve: "continuous",
		borderColor: theme.colors.gray,
	},
	mediaIcons: {
		gap: 12,
		alignItems: "center",
		flexDirection: "row",
	},
	addImageText: {
		fontSize: hp(1.9),
		fontWeight: theme.fonts.semibold,
		color: theme.colors.text,
	},
	imageIcon: {
		borderRadius: 14,
	},
	file: {
		height: hp(30),
		width: "100%",
		borderRadius: 18,
		borderCurve: "continuous",
		overflow: "hidden",
	},
	closeIcon: {
		position: "absolute",
		top: 10,
		right: 10,
	},
});
