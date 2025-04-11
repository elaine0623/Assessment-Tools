const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-100 text-gray-600 p-4 text-center text-sm">
      <p>© {new Date().getFullYear()} AI評核工具 - 保留所有權利</p>
    </footer>
  );
};

export default Footer;