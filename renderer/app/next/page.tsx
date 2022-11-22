import Link from "next/link";
import React from "react";

function Page() {
    return (
        <React.Fragment>
            <div className="grid-col-1 grid w-full text-center text-2xl">
                <img className="mx-auto" src="/images/logo/512x512.png" alt="logo"/>
                <span>⚡ Nextron ⚡</span>
            </div>
            <div className="mt-1 flex w-full flex-wrap justify-center">
                <Link href="/home" className="btn-blue">
                    Go to home page
                </Link>
            </div>
        </React.Fragment>
    );
}

export default Page;
