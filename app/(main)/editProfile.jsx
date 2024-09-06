import {
	StyleSheet,
	Text,
	View,
	ScrollView,
	Pressable,
	Alert,
} from "react-native";
import React, { useEffect, useState } from "react";
import ScreenWrapper from "../../components/ScreenWrapper";
import { hp, wp } from "../../helper/common";
import { theme } from "../../constants/theme";
import Header from "../../components/Header";
import { Image } from "expo-image";
import { useAuth } from "../../context/authContext";
import { getUserImage, uploadImage } from "../../services/imageServices";
import Icon from "../../assets/icons";
import Input from "../../components/Input";
import Button from "../../components/Button";
import { updateUser } from "../../services/userServices";
import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";

const EditProfile = () => {
	const { user: currentuser, setAuth } = useAuth();
	const [user, setUser] = useState({
		name: "",
		email: "",
		image: null,
		bio: "",
		address: "",
		phoneNumber: "",
	});
	const [loading, setLoading] = useState(false);
	const router = useRouter();

	useEffect(() => {
		if (currentuser) {
			setUser({
				name: currentuser.name || "",
				email: currentuser.email || "",
				image: currentuser.image || "",
				bio: currentuser.bio || "",
				address: currentuser.address || "",
				phoneNumber: currentuser.phoneNumber || "",
			});
		}
	}, [currentuser]);

	const requestPermissions = async () => {
		const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
		if (status !== "granted") {
			Alert.alert(
				"Permission needed",
				"You need to grant permission to access the gallery"
			);
			return false;
		}
		return true;
	};

	const onPick = async () => {
		const hasPermission = await requestPermissions();
		if (!hasPermission) return;

		let result = await ImagePicker.launchImageLibraryAsync({
			mediaTypes: ImagePicker.MediaTypeOptions.Images,
			allowsEditing: true,
			aspect: [4, 3],
			quality: 0.7,
		});

		if (!result.canceled) {
			setUser({ ...user, image: result.assets[0] });
		} else {
			console.log("Image selection canceled");
		}
	};

	const onSubmit = async () => {
		let userData = { ...user };
		let { name, phoneNumber, address, bio, image } = userData;
		if (!name || !image) {
			Alert.alert("Error", "Please fill all the fields");
			return;
		}
		setLoading(true);

		try {
			if (typeof image === "object") {
				let imageres = await uploadImage("profile", image?.uri, true);
				if (imageres) {
					userData.image = imageres;
				}
			}
			const res = await updateUser(currentuser?.id, userData);
			setLoading(false);
			if (res) {
				// Update state in auth context
				setAuth({ ...currentuser, ...userData });
				router.back();
				Alert.alert("Success", "Profile updated successfully");
			} else {
				Alert.alert("Error", "Failed to update profile");
			}
		} catch (error) {
			setLoading(false);
			Alert.alert("Error", "An error occurred while updating the profile");
			console.error("Profile update error: ", error);
		}
	};

	let imageSource =
		user.image && typeof user.image === "object"
			? user.image.uri
			: getUserImage(user.image);

	return (
		<ScreenWrapper>
			<View style={styles.container}>
				<ScrollView style={{ flex: 1 }}>
					<Header title='Edit Profile' />
					{/* form */}
					<View style={styles.form}>
						<View style={styles.avatarContainer}>
							<Image source={imageSource} style={styles.avatar} />
							<Pressable style={styles.cameraIcon} onPress={onPick}>
								<Icon name={"camera"} size={20} strokeWidth={2.5} />
							</Pressable>
						</View>
						<Text style={{ fontSize: hp(1.5), color: theme.colors.text }}>
							{" "}
							Tolong di isi ya !
						</Text>
						<Input
							icon={<Icon name='user' />}
							placeholder='Name'
							value={user.name}
							onChangeText={(value) => setUser({ ...user, name: value })}
						/>
						<Input
							icon={<Icon name='call' />}
							placeholder='Phone Number'
							value={user.phoneNumber}
							onChangeText={(value) => setUser({ ...user, phoneNumber: value })}
						/>
						<Input
							icon={<Icon name='location' />}
							placeholder='Location'
							value={user.address}
							onChangeText={(value) => setUser({ ...user, address: value })}
						/>
						<Input
							placeholder='Bio'
							value={user.bio}
							multiline={true}
							containerStyle={styles.bio}
							onChangeText={(value) => setUser({ ...user, bio: value })}
						/>
						<Button title='Update' loading={loading} onPress={onSubmit} />
					</View>
				</ScrollView>
			</View>
		</ScreenWrapper>
	);
};

export default EditProfile;

const styles = StyleSheet.create({
	container: {
		flex: 1,
		paddingHorizontal: wp(4),
	},
	avatarContainer: {
		height: hp(14),
		width: hp(14),
		alignSelf: "center",
	},
	avatar: {
		width: "100%",
		height: "100%",
		borderRadius: 18 * 1.8,
		borderCurve: "continuous",
		borderWidth: 1,
		borderColor: theme.colors.darkLight,
	},
	cameraIcon: {
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
	form: {
		gap: 18,
		marginTop: 20,
	},
	input: {
		flexDirection: "row",
		borderWidth: 0.4,
		borderColor: theme.colors.text,
		borderRadius: 22,
		borderCurve: "continuous",
		padding: 17,
		paddingHorizontal: 20,

		gap: 15,
	},
	bio: {
		flexDirection: "row",
		height: hp(15),
		alignItems: "flex-start",
		paddingVertical: 15,
	},
});
