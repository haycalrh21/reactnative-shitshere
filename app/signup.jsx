import {
	Alert,
	Pressable,
	StatusBar,
	StyleSheet,
	Text,
	View,
} from "react-native";
import React, { useState } from "react";
import ScreenWrapper from "../components/ScreenWrapper";
import Icon from "../assets/icons";
import BackButton from "../components/BackButton";
import { useRouter } from "expo-router";
import { theme } from "../constants/theme";
import { hp, wp } from "../helper/common";
import Input from "../components/Input";
import Button from "../components/Button";
import supabase from "../lib/supabase";

const SignUp = () => {
	const router = useRouter();

	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [loading, setLoading] = useState(false);

	const onSubmit = async () => {
		console.log("Name:", name);
		console.log("Email:", email);
		console.log("Password:", password);

		if (!name || !email || !password) {
			Alert.alert("Error", "Please fill all the fields");
			return;
		}

		setLoading(true);

		const { data, error } = await supabase.auth.signUp({
			email: email,
			password: password,
			options: {
				data: {
					name: name,
				},
			},
		});

		setLoading(false);

		if (error) {
			Alert.alert("Error", error.message);
		} else {
			console.log("Session:", data.session);
		}
	};

	return (
		<ScreenWrapper>
			<StatusBar barStyle='dark-content' />
			<View style={styles.container}>
				<BackButton router={router} />
				{/* welcome */}
				<View>
					<Text style={styles.welcomeText}>Lets</Text>
					<Text style={styles.welcomeText}>Get Started</Text>
				</View>
				{/* form */}
				<View style={styles.form}>
					<Text style={{ fontSize: hp(1.6), color: theme.colors.text }}>
						Please Sign up to Continue
					</Text>
					<Input
						placeholder='Name'
						icon={<Icon name='user' size={26} strokeWidth={2.5} />}
						onChangeText={(value) => setName(value)}
					/>
					<Input
						placeholder='Email'
						icon={<Icon name='mail' size={26} strokeWidth={2.5} />}
						onChangeText={(value) => setEmail(value)}
					/>
					<Input
						placeholder='Password'
						icon={<Icon name='lock' size={26} strokeWidth={2.5} />}
						secureTextEntry={true}
						onChangeText={(value) => setPassword(value)}
					/>
					{/* button signup */}
					<Button title='Sign Up' loading={loading} onPress={onSubmit} />
				</View>
				{/* footer */}
				<View style={styles.footer}>
					<Text style={styles.footerText}>Already have an account?</Text>
					<Pressable onPress={() => router.push("login")}>
						<Text
							style={[
								styles.footerText,
								{
									color: theme.colors.primary,
									fontWeight: theme.fonts.extrabold,
								},
							]}
						>
							Login
						</Text>
					</Pressable>
				</View>
			</View>
		</ScreenWrapper>
	);
};

export default SignUp;

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
