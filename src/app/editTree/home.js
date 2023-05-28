// temp store place
import { sendVerifyEmail } from '@/api/users';
import PageLayout from '@/components/PageLayout';
import SvgIcon from '@/components/SvgIcon';
import { useUser } from '@/hooks/useUser';
import { PlusOutlined } from '@ant-design/icons';
import { Tooltip } from 'antd';
import { t } from 'i18next';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React, { useEffect } from 'react';

const HomeView = () => {
  const { user } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (user && user.userState && user.userState === 'unverified') {
      const email = user.email;
      sendVerifyEmail(email).then(() => {
        router.replace('/users/verify');
      });
    }
  }, [user]);

  return (
    <PageLayout activeMenu="tools">
      {Products.map((item, index) => {
        return (
          <div key={index} className="mb-12">
            <div className="text-secondary mb-3 text-base">{item.title}</div>
            <div className="flex gap-x-6">
              {item.list.map((item, idx) => (
                <Link href={item.link} key={idx}>
                  <Tooltip title={item.disabled ? 'Coming soon...' : ''}>
                    <div className="hover:bg-[#325be90f] active:bg-[#325be91f] rounded-3xl border-line-[#E4E6F0] ">
                      <div className="px-8 py-6 flex justify-between items-center min-w-[342px]">
                        <div className="flex">
                          <SvgIcon
                            name={item.icon}
                            className="!size-[48]"
                          ></SvgIcon>
                          <div className="ml-4">
                            <div className="text-[#1A1E2D] mb-2 text-base">
                              {item.title}
                            </div>
                            <div className="text-secondary text-xs">
                              {item.desc}
                            </div>
                          </div>
                        </div>
                        <div>
                          <PlusOutlined
                            className="text-xl"
                            style={{ color: '#C0C2CC' }}
                          />
                        </div>
                      </div>
                    </div>
                  </Tooltip>
                </Link>
              ))}
            </div>
          </div>
        );
      })}
    </PageLayout>
  );
};

export default HomeView;
