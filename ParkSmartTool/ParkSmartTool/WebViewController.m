//
//  WebViewController.m
//  ParkSmartTool
//
//  Created by Cef Ramirez on 11/12/15.
//  Copyright © 2015 CMU. All rights reserved.
//

#import "WebViewController.h"

@interface WebViewController ()

@property (nonatomic, weak) IBOutlet UIWebView *webview;

- (IBAction)dismiss:(id)sender;

@end

@implementation WebViewController

- (void)viewDidLoad {
    [super viewDidLoad];
    NSURL *url = [NSURL URLWithString:@"http://parksmart.bekti.io"];
    NSURLRequest *request = [NSURLRequest requestWithURL:url];
    [self.webview loadRequest:request];
}

- (IBAction)dismiss:(id)sender
{
    [self dismissViewControllerAnimated:YES completion:nil];
}

@end
