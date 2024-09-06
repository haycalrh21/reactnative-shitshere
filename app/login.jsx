import {
	Alert,
	Pressable,
	StatusBar,
	StyleSheet,
	Text,
	View,
} from "react-native";
import React, { useRef, useState } from "react";
import ScreenWrapper from "../components/ScreenWrapper";
import Icon from "../assets/icons";
import BackButton from "../components/BackButton";
import { useRouter } from "expo-router";
import { theme } from "../constants/theme";
import { hp, wp } from "../helper/common";
import Input from "../components/Input";
import Button from "../components/Button";
import supabase from "../lib/supabase";

const Login = () => {
	const router = useRouter();

	const emailRef = useRef("");
	const passwordRef = useRef("");
	const [loading, setLoading] = useState(false);

	const onSubmit = async () => {
		console.log("Email:", emailRef.current);
		console.log("Password:", passwordRef.current);
		if (!emailRef.current || !passwordRef.current) {
			Alert.alert("Error", "Please fill all the fields");
			return;
		}

		let email = emailRef.current.trim();
		let password = passwordRef.current.trim();

		setLoading(true);

		const { error } = await supabase.auth.signInWithPassword({
			email: email,
			password: password,
		});

		setLoading(false);

		console.log("Error:", error);
		if (error) {
			Alert.alert("Login", error.message);
		} else {
			// Handle successful login here (e.g., redirect to another screen)
		}
	};

	return (
		<ScreenWrapper>
			<StatusBar barStyle='dark-content' />
			<View style={styles.container}>
				<BackButton router={router} />
				<View>
					<Text style={styles.welcomeText}>Hey,</Text>
					<Text style={styles.welcomeText}>Welcome Back</Text>
				</View>
				<View style={styles.form}>
					<Text style={{ fontSize: hp(1.6), color: theme.colors.text }}>
						Please Login to Continue
					</Text>
					<Input
						placeholder='Email'
						icon={<Icon name='mail' size={26} strokeWidth={2.5} />}
						onChangeText={(value) => (emailRef.current = value)}
					/>
					<Input
						placeholder='Password'
						icon={<Icon name='lock' size={26} strokeWidth={2.5} />}
						secureTextEntry={true}
						onChangeText={(value) => (passwordRef.current = value)}
					/>
					<Text style={styles.forgotPassword}>Forgot Password?</Text>
					<Button title='Login' loading={loading} onPress={onSubmit} />
				</View>
				<View style={styles.footer}>
					<Text style={styles.footerText}>Don't have an account?</Text>
					<Pressable onPress={() => router.push("signup")}>
						<Text
							style={[
								styles.footerText,
								{
									color: theme.colors.primary,
									fontWeight: theme.fonts.extrabold,
								},
							]}
						>
							Sign Up
						</Text>
					</Pressable>
				</View>
			</View>
		</ScreenWrapper>
	);
};

export default Login;

const styles = StyleSheet.create({
	container: {
		flex: 1,
		gap: 45,
		paddingHorizontal: wp(5),
	},
	welcomeText: {
		fontSize: hp(4),
		fontWeight: theme.fonts.bold,
		color: theme.colors.text,
	},
	form: {
		gap: 25,
	},
	forgotPassword: {
		textAlign: "right",
		fontWeight: theme.fonts.semibold,
		color: theme.colors.text,
	},
	footer: {
		flexDirection: "row",
		justifyContent: "center",
		alignItems: "center",
		gap: 5,
	},
	footerText: {
		color: theme.colors.text,
		textAlign: "center",
		fontSize: hp(1.6),
	},
});
