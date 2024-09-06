import { StyleSheet, View } from "react-native";
import React from "react";
import {
	RichToolbar,
	actions,
	RichEditor,
} from "react-native-pell-rich-editor";
import { theme } from "../constants/theme";

const RichTextEditor = ({ editorRef, onChange }) => {
	return (
		<View style={styles.container}>
			<RichToolbar
				editor={editorRef} // Directly pass editorRef
				action={[
					actions.setStrikethrough,
					actions.setUnderline,
					actions.setBold,
					actions.setItalic,
					actions.insertImage,
					actions.insertLink,
					actions.setSubscript,
					actions.setSuperscript,
					actions.setUnorderedList,
					actions.setOrderedList,
					actions.insertHR,
					actions.setUnlink,
					actions.setIndent,
					actions.setOutdent,
					actions.removeFormat,
					actions.setAlignLeft,
					actions.setAlignCenter,
					actions.setAlignRight,
					actions.setBlockquote,
					actions.setUnorderedList,
					actions.setOrderedList,
					actions.setLink,
				]}
				style={styles.richBar}
				disabled={false}
				flatContainerStyle={styles.listStyle}
			/>
			<RichEditor
				ref={editorRef}
				onChange={onChange}
				placeholder='Write something'
				style={styles.rich}
			/>
		</View>
	);
};

export default RichTextEditor;

const styles = StyleSheet.create({
	container: {
		minHeight: 285,
	},
	richBar: {
		borderTopRightRadius: theme.radius.xl,
		borderTopLeftRadius: theme.radius.xl,
		backgroundColor: theme.colors.gray,
	},
	listStyle: {
		borderColor: "#ddd",
	},
	rich: {
		minHeight: 240,
		flex: 1,
		borderWidth: 1.5,
		borderTopWidth: 0,
		borderBottomLeftRadius: theme.radius.xl,
		borderBottomRightRadius: theme.radius.xl,
		borderColor: theme.colors.gray,
		padding: 5,
	},
});
