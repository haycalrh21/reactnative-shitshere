import { StyleSheet, View, Text, Image, Pressable } from "react-native";
import React from "react";
import ScreenWrapper from "../components/ScreenWrapper";
import { StatusBar } from "expo-status-bar";
import { hp, wp } from "../helper/common";
import { theme } from "../constants/theme";
import Button from "../components/Button";
import { useRouter } from "expo-router";

const Welcome = () => {
	const router = useRouter();
	return (
		<ScreenWrapper bg='white'>
			<StatusBar style='dark' />
			<View style={style.container}>
				{/* gambar */}
				<Image
					style={style.image}
					resizeMode='contain'
					source={require("../assets/images/shitshere.png")}
				/>

				{/* tulisan */}
				<View style={{ gap: 20 }}>
					<Text style={style.title}>SHitSHere !</Text>
					<Text style={style.slogan}>Apa iya lucu ?</Text>
				</View>

				{/* footer */}
				<View style={style.footer}>
					<Button
						title='Get Started'
						buttonStyle={{ marginHorizontal: wp(3) }}
						onPress={() => router.push("signup")}
					/>
					<View style={style.bottomTextContainter}>
						<Text style={style.loginText}>Already have an account? </Text>
						<Pressable onPress={() => router.push("login")}>
							<Text
								style={
									(style.loginText,
									{
										color: theme.colors.primary,
										fontWeight: theme.fonts.semibold,
									})
								}
							>
								Login
							</Text>
						</Pressable>
					</View>
				</View>
			</View>
		</ScreenWrapper>
	);
};

export default Welcome;

const style = StyleSheet.create({
	container: {
		flex: 1,
		justifyContent: "space-around",
		alignItems: "center",
		backgroundColor: "white",
		marginHorizontal: wp(4),
	},
	image: {
		height: hp(30),
		width: wp(100),
		alignSelf: "center",
	},
	title: {
		color: theme.colors.text,
		fontSize: hp(4),
		textAlign: "center",
		fontWeight: theme.fonts.extrabold,
	},
	slogan: {
		color: theme.colors.text,
		paddingHorizontal: wp(10),
		fontSize: hp(1.7),
		textAlign: "center",
	},
	footer: {
		width: "100%",
		gap: 30,
	},

	bottomTextContainter: {
		flexDirection: "row",
		justifyContent: "center",
		alignItems: "center",
		gap: 5,
	},
	loginText: {
		textAlign: "center",
		color: theme.colors.text,
		fontSize: hp(1.6),
	},
});
