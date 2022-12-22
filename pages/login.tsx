import React, { useEffect, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useClaimNFT, useLogin, useLogout, useProgram, useUser, useDropUnclaimedSupply, useNFTs } from "@thirdweb-dev/react/solana";
import { wallet } from "./_app";
import { useRouter } from "next/router";
import { NFT } from "@thirdweb-dev/sdk";
import Link from "next/link";
import Image from "next/image";

function LoginPage() {
    const [usersNft, setUsersNft] = useState<NFT | undefined>();
    const login = useLogin();
    const logout = useLogout();
    const router = useRouter();
    const { user } = useUser();
    const { publicKey, connect, select } = useWallet();

    const { program } = useProgram(
        process.env.NEXT_PUBLIC_PROGRAM_ADDRESS, "nft-drop"
    );

    const { data: unclaimedSupply } = useDropUnclaimedSupply(program);
    const { data: nfts, isLoading } = useNFTs(program);
    const { mutateAsync: claim } = useClaimNFT(program);

    useEffect(() => {
        if (!publicKey) {
            select(wallet.name);
            connect();
        }
    }, [connect, publicKey, select]);

    useEffect(() => {
        if (!user || !nfts) return;

        const usersNft = nfts.find((nft) => nft.owner === user?.address);

        if (usersNft) {
            setUsersNft(usersNft);
        }
    }, [nfts, user]);

    const handleLogin = async () => {
        await login();
        router.replace("/");
    };

    const handlePurchase = async () => {
        await claim({
            amount: 1,
        });
        router.replace("/");
    };

    return (
        <div className="flex min-h-screen flex-col items-center justify-center text-center bg-[#f1f82a]">
            <div className="absolute top-56 left-0 w-full h-1/4 bg-fuchsia-500 skew-y-6 z-10 overflow-hidden shadow-xl" />
            <Image 
                className="mt-5 z-30 shadow-2xl mb-10 rounded-full"
                src="/logo.jpg"
                alt="logo"
                width={400}
                height={400}
            />

            <main className="z-30 text-black">
                <h1 className="text-4xl font-bold uppercase">
                    Welcome to the <span className="text-fuchsia-500">MOMO</span>
                </h1>

                {!user && (
                    <div>
                        <button 
                            onClick={handleLogin}
                            className="text-2xl font-bold mb-5 bg-fuchsia-400 text-black py-4 px-10 border-2 border-fusbg-fuchsia-400 animate-pulse rounded-md transition duration-200 mt-5"
                        >
                            Login / Connect Wallet
                        </button>
                    </div>
                )}

                {user && (
                    <div>
                        <p className="text-lg text-fuchsia-400 font-bold mb-10">
                            Welcome {user.address.slice(0, 5)}...{user.address.slice(-5)}
                        </p>

                        {isLoading && (
                            <div className="text-2xl font-bold mb-5 bg-fuchsia-400 text-black py-4 px-10 border-2 border-fusbg-fuchsia-400 animate-pulse rounded-md transition duration-200">
                                Hold on, We `&apos;`re just looking for your MOMO Membership pass...
                            </div>
                        )}

                        {usersNft && (
                            <Link
                                href="/"
                                className="text-2xl font-bold mb-5 bg-fuchsia-400 text-black py-4 px-10 border-2 border-fusbg-fuchsia-400 animate-pulse rounded-md transition duration-200 hover:bg-white hover:text-fuchsia-400 mt-5 uppercase"
                            >
                                ACCESS GRANTED - ENTER
                            </Link>
                        )}

                        {!usersNft && 
                            !isLoading &&
                            (unclaimedSupply && unclaimedSupply > 0 ? (
                                <button
                                    onClick={handlePurchase}
                                    className="bg-fuchsia-400 text-black py-4 px-10 border-2 border-fuchsia-400 rounded-md hover:bg-white hover:text-fuchsia-400 mt-5 uppercase font-bold transition duration-200"
                                >
                                    Buy a MOMO Membership Pass
                                </button>
                            ) : (
                                <p className="text-2xl font-bold mb-5 bg-red-600 text-white py-4 px-10 border-2 border-red-600 rounded-mb uppercase transition duration-200">
                                    Sorry, we`&apos;`re all out of Momo Membership passes!
                                </p>
                            ))}
                    </div>
                )}

                {user && (
                    <button
                        onClick={logout}
                        className="bg-white text-fuchsia-400 py-4 px-10 border-2 border-fuchsia-500 rounded-md hover:bg-fuchsia-500 hover:text-white mt-10 uppercase font-bold transition duration-200"
                    >
                        logout
                    </button>
                )}
            </main>
        </div>
    );
}

export default LoginPage;
