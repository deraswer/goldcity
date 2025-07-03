import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FiMenu, FiX } from "react-icons/fi";
import { useDispatch, useSelector } from "react-redux";
import { ethers } from "ethers";
import {
  setCredentials,
  setWalletAddress,
  setChainId,
  setLoading,
  setError,
} from "../../features/auth/authSlice";
import {
  useGetChallengeMutation,
  useVerifySignatureMutation,
  useGetUserProfileQuery,
} from "../../features/auth/authApiSlice";
import ProfileNavbar from "./ProfileNavbar";

function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [provider, setProvider] = useState(null);
  const { walletAddress, token, isAuthenticated } = useSelector(
    (state) => state.auth
  );
  const dispatch = useDispatch();

  const [getChallenge] = useGetChallengeMutation();
  const [verifySignature] = useVerifySignatureMutation();
  const { refetch: refetchUserProfile } = useGetUserProfileQuery(undefined, {
    skip: !isAuthenticated,
  });

  useEffect(() => {
    const checkProvider = async () => {
      if (window.ethereum) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        setProvider(provider);

        window.ethereum.on("accountsChanged", (accounts) => {
          if (accounts.length > 0 && token) {
            dispatch(setWalletAddress(accounts[0]));
          } else {
            dispatch(setWalletAddress(null));
          }
        });

        window.ethereum.on("chainChanged", (chainId) => {
          dispatch(setChainId(parseInt(chainId, 16)));
        });
      }
    };

    checkProvider();

    return () => {
      if (window.ethereum) {
        window.ethereum.removeAllListeners("accountsChanged");
        window.ethereum.removeAllListeners("chainChanged");
      }
    };
  }, [dispatch, token]);

  const connectWallet = async () => {
    if (!provider) {
      alert("MetaMask is not installed!");
      return;
    }

    try {
      dispatch(setLoading(true));

      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      const walletAddress = accounts[0];
      const { chainId } = await provider.getNetwork();

      const chainName = chainId === 80002 ? "polygon" : "polygon";
      const challengeResponse = await getChallenge({
        walletAddress,
        chain: chainName,
      }).unwrap();

      const signer = provider.getSigner();
      const signature = await signer.signMessage(challengeResponse.challenge);
      const key = challengeResponse.key;

      const verifyResponse = await verifySignature({
        walletAddress,
        signature,
        chain: chainName,
        key: key,
      }).unwrap();

      if (verifyResponse.success) {
        dispatch(
          setCredentials({
            user: { walletAddress },
            token: verifyResponse.token,
          })
        );
        dispatch(setWalletAddress(walletAddress));
        dispatch(setChainId(chainId));
        // Ждем обновления состояния перед рефетчем
        setTimeout(() => refetchUserProfile(), 100); // Задержка для синхронизации
      }
    } catch (error) {
      console.error("Error connecting wallet:", error);
      dispatch(setError(error.message || "Failed to connect wallet"));
      dispatch(setWalletAddress(null));
    } finally {
      dispatch(setLoading(false));
    }
  };

  const handleToggleMenu = (e) => {
    e.preventDefault();
    setIsMenuOpen(!isMenuOpen);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      const menuElement = document.querySelector(".profile-navbar");
      if (isMenuOpen && menuElement && !menuElement.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMenuOpen]);

  const navigation = [
    { name: "Home", href: "/" },
    { name: "Properties", href: "/properties" },
    { name: "About", href: "/about" },
    { name: "FAQ", href: "/faq" },
    { name: "Blog", href: "/blog" },
  ];

  return (
    <nav className="bg-white shadow-sm relative">
      <div className="container">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link to="/" className="flex items-center">
              <svg
                width="30"
                height="35"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle cx="15" cy="20" r="10" stroke="#0682ff" />
                <circle
                  cx="15"
                  cy="20"
                  r="6"
                  stroke="#0682ff"
                  strokeWidth="3"
                />
              </svg>
              <span className="text-2xl font-bold text-primary-600 mt-1.5">
                GoldenCity
              </span>
            </Link>
          </div>

          <div className="hidden md:flex md:items-center md:space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className="text-secondary-600 hover:text-primary-600 px-3 py-2 text-sm font-medium"
              >
                {item.name}
              </Link>
            ))}
            <div className="relative">
              {!walletAddress ? (
                <button
                  onClick={connectWallet}
                  className="dark-button flex items-center justify-center px-6 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
                >
                  Connect Wallet
                </button>
              ) : (
                <a
                  href="#"
                  onClick={handleToggleMenu}
                  className="text-secondary-600 hover:text-primary-600 px-3 py-2 text-sm font-medium"
                >
                  {`${walletAddress.substring(
                    0,
                    6
                  )}...${walletAddress.substring(walletAddress.length - 4)}`}
                </a>
              )}
              {isMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-10 profile-navbar">
                  <ProfileNavbar onClose={() => setIsMenuOpen(false)} />
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center md:hidden">
            <button
              type="button"
              className="text-secondary-600 hover:text-primary-600"
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? <FiX size={24} /> : <FiMenu size={24} />}
            </button>
          </div>
        </div>

        {isOpen && (
          <div className="md:hidden">
            <div className="pt-2 pb-3 space-y-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className="block px-3 py-2 text-base font-medium text-secondary-600 hover:text-primary-600 hover:bg-primary-50"
                  onClick={() => setIsOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              <div className="relative">
                {!walletAddress ? (
                  <button
                    onClick={connectWallet}
                    className="block px-3 py-2 text-base font-medium text-white bg-primary-600 hover:bg-primary-700"
                  >
                    Connect
                  </button>
                ) : (
                  <a
                    href="#"
                    onClick={handleToggleMenu}
                    className="block px-3 py-2 text-base font-medium text-secondary-600 hover:text-primary-600"
                  >
                    {`${walletAddress.substring(
                      0,
                      6
                    )}...${walletAddress.substring(walletAddress.length - 4)}`}
                  </a>
                )}
                {isMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-10 profile-navbar">
                    <ProfileNavbar onClose={() => setIsMenuOpen(false)} />
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
