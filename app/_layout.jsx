import { View, Text, LogBox } from "react-native";
import React, { useEffect, useState } from "react";
import { Stack, useRouter } from "expo-router";
import { AuthProvider, useAuth } from "../context/authContext";
import Supabase from "../lib/supabase";
import getUserData from "../services/userServices";

LogBox.ignoreLogs([
	"Warning: TNodeChildrenRenderer",
	"Warning: MemoizedTNodeRenderer",
	"TRenderEngineProvider",
]);

const Layout = () => {
	return (
		<AuthProvider>
			<MainLayout />
		</AuthProvider>
	);
};

const MainLayout = () => {
	const { user, setAuth, setUserData } = useAuth();
	const [isLoading, setIsLoading] = useState(true);
	const router = useRouter();

	useEffect(() => {
		const setupAuth = async () => {
			try {
				// Set up the auth state change listener
				Supabase.auth.onAuthStateChange(async (_event, session) => {
					if (session?.user) {
						setAuth(session.user);
						const { success, data } = await getUserData(session.user.id);
						if (success) {
							setUserData(data);
							console.log("User data:", data);
						} else {
							console.error("Failed to fetch user data");
						}
						router.replace("/home");
					} else {
						setAuth(null);
						router.replace("/welcome");
					}
				});
			} catch (error) {
				console.error("Error setting up auth:", error);
			} finally {
				setIsLoading(false);
			}
		};

		setupAuth();
	}, []);

	if (isLoading) {
		return <Text>Loading...</Text>;
	}

	return (
		<Stack
			screenOptions={{
				headerShown: false,
			}}
		>
			<Stack.Screen
				name='(main)/postDetails'
				options={{ presentation: "modal" }}
			/>
		</Stack>
	);
};

export default Layout;
