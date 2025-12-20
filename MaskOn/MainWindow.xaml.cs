using Microsoft.Web.WebView2.Core;
using Microsoft.Web.WebView2.Wpf;
using System.Diagnostics;
using System.IO;
using System.Runtime.InteropServices;
using System.Text;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Data;
using System.Windows.Documents;
using System.Windows.Input;
using System.Windows.Interop;
using System.Windows.Media;
using System.Windows.Media.Imaging;
using System.Windows.Navigation;
using System.Windows.Shapes;

namespace MaskOn
{
    /// <summary>
    /// Interaction logic for MainWindow.xaml
    /// </summary>
    public partial class MainWindow : Window
    {
        const int WM_NCHITTEST = 0x0084;
        const int HTCLIENT = 1;
        const int HTLEFT = 10;
        const int HTRIGHT = 11;
        const int HTTOP = 12;
        const int HTTOPLEFT = 13;
        const int HTTOPRIGHT = 14;
        const int HTBOTTOM = 15;
        const int HTBOTTOMLEFT = 16;
        const int HTBOTTOMRIGHT = 17;

        const int RESIZE_BORDER = 8;
        public MainWindow()
        {
            InitializeComponent();

            Loaded += MainWindow_Loaded;
            MouseDoubleClick += WindowDoubleClicked;
            SourceInitialized += OnSourceInitialized;
        }

        private void OnSourceInitialized(object? sender, EventArgs e)
        {
            var hwnd = new WindowInteropHelper(this).Handle;
            HwndSource.FromHwnd(hwnd).AddHook(WndProc);
        }
        private IntPtr WndProc(
       IntPtr hwnd,
       int msg,
       IntPtr wParam,
       IntPtr lParam,
       ref bool handled)
        {
            if (msg == WM_NCHITTEST)
            {
                handled = true;

                var mousePos = GetMousePosition(lParam);
                var windowPos = PointFromScreen(mousePos);

                if (windowPos.Y <= RESIZE_BORDER)
                {
                    if (windowPos.X <= RESIZE_BORDER)
                        return (IntPtr)HTTOPLEFT;
                    if (windowPos.X >= ActualWidth - RESIZE_BORDER)
                        return (IntPtr)HTTOPRIGHT;
                    return (IntPtr)HTTOP;
                }

                if (windowPos.Y >= ActualHeight - RESIZE_BORDER)
                {
                    if (windowPos.X <= RESIZE_BORDER)
                        return (IntPtr)HTBOTTOMLEFT;
                    if (windowPos.X >= ActualWidth - RESIZE_BORDER)
                        return (IntPtr)HTBOTTOMRIGHT;
                    return (IntPtr)HTBOTTOM;
                }

                if (windowPos.X <= RESIZE_BORDER)
                    return (IntPtr)HTLEFT;
                if (windowPos.X >= ActualWidth - RESIZE_BORDER)
                    return (IntPtr)HTRIGHT;

                handled = false;
            }

            return IntPtr.Zero;
        }

        private Point GetMousePosition(IntPtr lParam)
        {
            int x = (short)((int)lParam & 0xFFFF);
            int y = (short)(((int)lParam >> 16) & 0xFFFF);
            return new Point(x, y);
        }

        private void DragBar_MouseLeftButtonDown(object sender, MouseButtonEventArgs e)
        {
            if (e.ButtonState == MouseButtonState.Pressed)
            {
                WindowState = WindowState.Normal;
                DragMove();
                
            }   

            Debug.WriteLine("OK");
        }

        private void Close_Click(object sender, RoutedEventArgs e)
        {
            Close();
        }
        private async void MainWindow_Loaded(object sender, RoutedEventArgs e)
        {
            CoreWebView2EnvironmentOptions options = new CoreWebView2EnvironmentOptions("--disable-web-security");
            // Define a custom user data folder path (e.g., in the app's roaming data folder)
            string userDataFolder = System.IO.Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.ApplicationData), "MaskOn", "WebView2Storage");

            CoreWebView2Environment environment = await CoreWebView2Environment.CreateAsync("", userDataFolder, options);
            await  webview.EnsureCoreWebView2Async(environment);

            webview.CoreWebView2.Settings.AreHostObjectsAllowed = true;
            webview.CoreWebView2.Settings.IsScriptEnabled = true;
            webview.CoreWebView2.Settings.IsWebMessageEnabled = true;

            webview.CoreWebView2.SetVirtualHostNameToFolderMapping("maskon",new Uri(System.IO.Path.GetFullPath(@"..\..\..\")).AbsolutePath, CoreWebView2HostResourceAccessKind.Allow);

            InitializeWebview2Permission();
            webview.CoreWebView2.AddHostObjectToScript("Movers", new Mover(Moverg));
            webview.Source = new Uri("https://maskon/index.html");

            //Panel.SetZIndex(Border, 1000);
            Debug.WriteLine("HERE");
            webview.MouseLeftButtonDown += WebviewLeftButtonDown;
            //webview.Focus();
            //webview.CaptureMouse();
            //webview.IsHitTestVisibleChanged += (s, ev) =>
            //{
            //    Debug.WriteLine("HERE IsHitTestVisibleChanged");
            //};
            //webview.IsHitTestVisible = true;
            webview.MouseEnter += MouseIn;
            //webview.MouseRightButtonDown += WebviewRightButtonDown;
            //webview.Focusable = true;
            //webview.ForceCursor = true;
            


        }

        [ClassInterface(ClassInterfaceType.AutoDual)]

        [ComVisible(true)]

        public class Mover 
        { 
            Grid Moverg = new Grid();
            Boolean IsMove = false;
            float PastX = 0.0f;
            float Pasty = 0.0f;
            public Mover() { Debug.WriteLine("here in Movers"); }
            public Mover(Grid M) 
            {
               this.Moverg = M;
               this.IsMove = false;

            }

            public void Moving()
            {
                if (IsMove)
                {
                    Moverg.Width = 1000f;
                    Moverg.Height = 1000f;
                    IsMove = true;
                }
            }

            public void StopMoving()
            {
                Moverg.Width = PastX;
                Moverg.Height = Pasty;
                IsMove = false;
            }

            public void GetData(String data, String WH)
            {
                Debug.WriteLine(data);
                Moverg.RenderTransform = new TranslateTransform();
                var HW = WH.Split(',');
                if (!IsMove)
                {
                    Moverg.Width = float.Parse(HW[0]);
                    Moverg.Height = float.Parse(HW[1]);
                    PastX = float.Parse(HW[0]);
                    Pasty = float.Parse(HW[1]);
                }
                Moverg.Dispatcher.Invoke(() =>
                {
                    Debug.WriteLine("Data from JS: " + data);
                    var coords = data.Split(',');
                    if (coords.Length == 2 &&
                        double.TryParse(coords[0], out double x) &&
                        double.TryParse(coords[1], out double y))
                    {
                        
                        Moverg.RenderTransform = new TranslateTransform(x-725, y-335);
                        IsMove = true;
                    }
                });

            }
        
        }

        private void CoreWebView2_PermissionRequested(object? sender, CoreWebView2PermissionRequestedEventArgs e)
        {
            if (e.PermissionKind == Microsoft.Web.WebView2.Core.CoreWebView2PermissionKind.Camera ||
                e.PermissionKind == Microsoft.Web.WebView2.Core.CoreWebView2PermissionKind.Microphone)
            {
                // Optionally, check the request origin (args.Uri) to ensure it's a trusted site

                // Grant the permission automatically
                e.State = Microsoft.Web.WebView2.Core.CoreWebView2PermissionState.Allow;
                e.Handled = true; // Mark the event as handled to suppress the default UI prompt
            }
        }

        private void InitializeWebview2Permission()
        {
            if(webview.CoreWebView2 != null)
            {
                webview.CoreWebView2.PermissionRequested += CoreWebView2_PermissionRequested;

            }
            else
            {
                webview.EnsureCoreWebView2Async().ContinueWith(task =>
                {
                    if (task.IsCompleted)
                    {
                        webview.CoreWebView2.PermissionRequested += CoreWebView2_PermissionRequested;
                    }
                });
            }

        }

        private void WebviewLeftButtonDown(object sender, MouseButtonEventArgs e)
        {
            //if (e.ButtonState == MouseButtonState.Pressed)
            //    WindowState = WindowState.Normal;
            Debug.WriteLine("HEREhhhjk");
        }

        private void WindowDoubleClicked(object sender, MouseButtonEventArgs e)
        {
            if (e.ButtonState == MouseButtonState.Pressed)
                WindowState = WindowState.Minimized;
            Debug.WriteLine("HEREjjj");
        }

        private void Mousdown(object sender, MouseButtonEventArgs e)
        {
            //if (e.ButtonState == MouseButtonState.Pressed)
            //    WindowState = WindowState.Minimized;
            Debug.WriteLine("HERE");
        }

        private void MouseRight(object sender, MouseButtonEventArgs e)
        {
           // Debug.WriteLine("HERE");

        }

        private void MouseIn(object sender, MouseEventArgs e)
        {
            Debug.WriteLine("HEREkkkkk");
        }

        private void WebviewRightButtonDown(object sender, MouseButtonEventArgs e)
        {
            Debug.WriteLine("HEREkoe");
        }

        private void MouseDownWindow(object sender, MouseButtonEventArgs e)
        {
            //Debug.WriteLine("HERE");
        }

        private void ResizeWindow(object sender, MouseButtonEventArgs e)
        {
            if (e.ButtonState == MouseButtonState.Pressed)
            {
                //ResizeMode = ResizeMode.CanResize;
                //Resizeer.CaptureMouse();
                //Resizeer.MouseMove += (s, ev) =>
                //{
                //    if (ev.LeftButton == MouseButtonState.Pressed)
                //    {
                //        var pos = ev.GetPosition(this);
                //        Width = pos.X + RESIZE_BORDER;
                //        Height = pos.Y + RESIZE_BORDER;
                //    }
                //};
            }
        }

        private void Drag_ReleaseLeftClick(object sender, MouseButtonEventArgs e)
        {
            Debug.WriteLine("HEREss");
            WindowState = WindowState.Maximized;
            //if (e.ButtonState == MouseButtonState.Released)
               
        }

        private void MouseLeaving(object sender, MouseEventArgs e)
        {
            Debug.WriteLine("OK Its HERE");
            WindowState = WindowState.Maximized;
        }
    }
}