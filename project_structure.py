import os

# ====== CONFIGURATION ======
OUTPUT_FILE = "folder_structure.txt"
INCLUDE_EXTENSIONS = [".js", ".py"]      # List of allowed file extensions
EXCLUDE_DIRS = ["node_modules", ".git"]  # Folders to ignore completely
# ===========================

def draw_structure(root_dir, output_file):
    with open(output_file, "w", encoding="utf-8") as f:
        for current_path, dirs, files in os.walk(root_dir):
            # Skip excluded folders
            dirs[:] = [d for d in dirs if d not in EXCLUDE_DIRS]

            rel_path = os.path.relpath(current_path, root_dir)
            if rel_path == ".":
                level = 0
                folder_name = "root"
            else:
                level = rel_path.count(os.sep)
                folder_name = os.path.basename(current_path)

            indent = "    " * level
            f.write(f"{indent}└── {folder_name}/\n")

            sub_indent = "    " * (level + 1)
            for file in sorted(files):
                if file == OUTPUT_FILE:
                    continue
                if INCLUDE_EXTENSIONS:
                    if not any(file.endswith(ext) for ext in INCLUDE_EXTENSIONS):
                        continue
                f.write(f"{sub_indent}└── {file}\n")

def ensure_empty_folders_marked(root_dir):
    for dirpath, dirs, files in os.walk(root_dir):
        # Skip excluded folders
        dirs[:] = [d for d in dirs if d not in EXCLUDE_DIRS]

        if dirpath == root_dir:
            continue

        allowed_files = [
            f for f in files
            if any(f.endswith(ext) for ext in INCLUDE_EXTENSIONS)
        ]

        if not allowed_files and not any(os.path.isdir(os.path.join(dirpath, d)) for d in dirs):
            empty_file_path = os.path.join(dirpath, ".empty")
            open(empty_file_path, "a").close()

if __name__ == "__main__":
    root = os.getcwd()
    ensure_empty_folders_marked(root)
    draw_structure(root, os.path.join(root, OUTPUT_FILE))
    print(f"\n✅ Structure saved to '{OUTPUT_FILE}', ignoring: {EXCLUDE_DIRS}, showing only: {INCLUDE_EXTENSIONS}")
