import { GoogleLogout } from "react-google-login";

const clientId = "883938822035-dj7j3okqd7q1855fegttrgnd37mvcbd8.apps.googleusercontent.com";

function Logout() {

    const onSuccess = () => {
        console.log("Log out successfull!");
    }

    return (
        <div id="signOutButton">
            <GoogleLogout
                clientId={clientId}
                buttonText={"Logout"}
                onLogoutSuccess={onSuccess}
            />

        </div>
    )
}

export default Logout;