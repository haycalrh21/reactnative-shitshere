import { decode } from "base64-arraybuffer";
import * as FileSystem from "expo-file-system";
import Supabase from "../lib/supabase";
import { supabaseUrl } from "../constants";

export const getUserImage = (imagePath) => {
	if (imagePath) {
		return getSupabaseFilePath(imagePath);
	} else {
		return require("../assets/images/defaultUser.png");
	}
};

export const getSupabaseFilePath = (filePath) => {
	if (filePath) {
		return {
			uri: `${supabaseUrl}/storage/v1/object/public/uploads/${filePath}`,
		};
	}
	return null;
};

export const uploadImage = async (folderName, fileUri, isImage = true) => {
	try {
		const fileName = getFilePath(folderName, isImage);
		const fileBase64 = await FileSystem.readAsStringAsync(fileUri, {
			encoding: FileSystem.EncodingType.Base64,
		});
		const imageData = decode(fileBase64);

		const { data, error } = await Supabase.storage
			.from("uploads")
			.upload(fileName, imageData, {
				upsert: false,
				cacheControl: "3600",
				contentType: isImage ? "image/png" : "video/mp4",
			});

		if (error) {
			console.error("Error uploading image:", error);
			return null;
		}

		return data.path;
	} catch (error) {
		console.error("Error in uploadImage:", error);
		return null;
	}
};

const getFilePath = (folderName, isImage) => {
	return `${folderName}/${new Date().getTime()}${isImage ? ".png" : ".mp4"}`;
};

export const downloadFIle = async (url) => {
	try {
		const localFilePath = getLocalFilePath(url);
		const { uri } = await FileSystem.downloadAsync(url, localFilePath);
		return uri; // Mengembalikan URI lokal dari file yang diunduh
	} catch (error) {
		console.error("Error downloading file:", error);
		return null;
	}
};

export const getLocalFilePath = (filepath) => {
	let fileName = filepath.split("/").pop();
	return `${FileSystem.documentDirectory}${fileName}`;
};
