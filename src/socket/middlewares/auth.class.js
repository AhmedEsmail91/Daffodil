class Auth {
    constructor(socket) {
        this.socket = socket;
        this.token = null;
        this.user = null;
        this.lang = "en";
    }

    extractToken() {
        const { handshake } = this.socket;
        return (
            handshake.auth?.token ||
            handshake.query?.token ||
            handshake.headers['authorization']
        );
    }

    extractLang() {
        const lang = this.socket.handshake.headers.lang || "en";
        if (typeof lang !== 'string' || lang.length !== 2) {
            throw new Error("Invalid language format");
        }
        this.lang = lang;
    }

    authenticate() {
        this.token = this.extractToken();
        if (!this.token) {
            throw new Error("Authentication token missing");
        }
        // Replace with real validation logic
        if (this.token !== "validtoken") {
            throw new Error("Invalid authentication token");
        }
        this.user = { token: this.token };
        this.socket.user = this.user;
        this.extractLang();
        this.socket.lang = this.lang;
    }

    allowedTo(permissions = [], and = false) {
        if (!this.user) throw new Error("User not authenticated");
        if (!Array.isArray(permissions)) throw new Error("Permissions must be an array");
        if (permissions.length === 0) return true;

        // Simulate user permissions if not present (for demo purposes)
        // In production, fetch permissions from user data (e.g., from DB or token)
        const userPermissions = Array.isArray(this.user.permissions) ? this.user.permissions : [];

        if (and) {
            // User must have all specified permissions
            return permissions.every(permission => userPermissions.includes(permission));
        } else {
            // User must have at least one of the specified permissions
            return permissions.some(permission => userPermissions.includes(permission));
        }
    }

    // Additional example functions
    getUser() {
        return this.user;
    }

    getLang() {
        return this.lang;
    }
}
