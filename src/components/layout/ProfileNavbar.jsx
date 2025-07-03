// src/components/layout/ProfileNavbar.jsx
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logOut } from "../../features/auth/authSlice";
import { useLogoutMutation } from "../../features/auth/authApiSlice";
import { clearIdentity } from "../../features/identity/identitySlice";
import { clearCredentials } from "../../features/credentials/credentialsSlice";
import { clearKyc } from "../../features/kyc/kycSlice";
import { clearBridge } from "../../features/bridge/bridgeSlice";
import PROFILE_SIDEBAR_MENU from "../../consts/ProfileSidebarMenu";
import AvatarPlaceholder from "../../assets/avatar-placeholder.gif";

const ProfileNavbar = ({ onClose }) => {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [logoutMutation] = useLogoutMutation();

  const handleLogout = async () => {
    try {
      await logoutMutation().unwrap();
      dispatch(logOut());
      dispatch(clearIdentity());
      dispatch(clearCredentials());
      dispatch(clearKyc());
      dispatch(clearBridge());
      navigate("/");
      if (onClose) onClose();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <div className="py-2">
      <div className="flex items-center p-2 space-x-3">
        <img
          src={AvatarPlaceholder}
          alt=""
          className="w-8 h-8 rounded-full bg-gray-500"
        />
        <div>
          <h2 className="text-sm font-semibold">
            {user?.walletAddress &&
              `${user.walletAddress.substring(
                0,
                6
              )}...${user.walletAddress.substring(
                user.walletAddress.length - 4
              )}`}
          </h2>
        </div>
      </div>
      <ul className="space-y-1 text-sm">
        {PROFILE_SIDEBAR_MENU.map((item) => (
          <li key={item.label}>
            <Link
              to={item.path}
              className="flex items-center p-2 space-x-2 rounded-md hover:bg-gray-100"
              onClick={onClose}
            >
              {item.icon}
              <span>{item.label}</span>
            </Link>
          </li>
        ))}
        <li>
          <a
            href="#"
            className="flex items-center p-2 space-x-2 rounded-md hover:bg-gray-100"
            onClick={(e) => {
              e.preventDefault();
              handleLogout();
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 512 512"
              className="w-5 h-5 fill-current text-gray-600"
            >
              <path d="M440,424V88H352V13.005L88,58.522V424H16v32h86.9L352,490.358V120h56V456h88V424ZM320,453.642,120,426.056V85.478L320,51Z"></path>
              <rect width="32" height="64" x="256" y="232"></rect>
            </svg>
            <span>Logout</span>
          </a>
        </li>
      </ul>
    </div>
  );
};

export default ProfileNavbar;
